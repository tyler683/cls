import * as firebaseApp from 'firebase/app';
const { initializeApp, getApp, getApps } = firebaseApp as any;
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  onSnapshot, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { firebaseConfig, IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { Post, Comment, GalleryItem } from '../types';
import { diagnostics } from './diagnostics';

export interface HealthCheckResult {
  firestore: { status: 'ok' | 'error' | 'pending'; message: string };
  storage: { status: 'ok' | 'error' | 'pending'; message: string };
}

let db: any = null;
let firestorage: any = null;
let isConnected = false;

if (IS_FIREBASE_CONFIGURED) {
  try {
    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      db = getFirestore(app); 
    }
    diagnostics.log('success', 'Firestore initialized');

    if (firebaseConfig.storageBucket) {
      firestorage = getStorage(app);
      diagnostics.log('success', `Storage initialized with bucket: ${firebaseConfig.storageBucket}`);
    } else {
      diagnostics.log('warn', 'No storageBucket configured. Storage unavailable.');
    }
    
    isConnected = true;
    diagnostics.log('success', 'Firebase initialized (Stable Long Polling active)');
  } catch (error: any) {
    diagnostics.log('warn', "Firebase connectivity failed. Local mode active.", error.message);
  }
} else {
  diagnostics.log('warn', 'Firebase not configured. Running in local mode.');
}

export const getDb = () => db;
export const isFirebaseReady = () => isConnected;

const removeUndefined = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined);

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        result[key] = removeUndefined(val);
      }
    }
  }
  return result;
};

const sanitizeForFirestore = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cache = new WeakSet();
  const clean = (item: any): any => {
    if (item === null || typeof item !== 'object') return item;
    if (cache.has(item)) return "[Circular]";
    cache.add(item);
    
    if (Array.isArray(item)) return item.map(clean);
    
    const result: any = {};
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const val = item[key];
        // Skip internal/private fields and functions
        if (key.startsWith('_') || typeof val === 'function' || val === undefined) continue;
        result[key] = clean(val);
      }
    }
    return result;
  };

  try {
    return clean(obj);
  } catch (e) {
    return String(obj);
  }
};

export const subscribeToGallery = (callback: (items: GalleryItem[]) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'gallery'), (s) => {
    callback(s.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
  }, (err) => {
    diagnostics.log('error', 'Gallery sync error', err);
    if (onError) onError(err);
  });
};

export const addGalleryItemToDb = async (item: GalleryItem) => {
  if (!db) return;
  const { id, ...data } = item;
  await setDoc(doc(db, 'gallery', id), removeUndefined(sanitizeForFirestore(data)));
};

export const updateGalleryItemInDb = async (item: GalleryItem) => {
  if (!db) return;
  const { id, ...data } = item;
  await updateDoc(doc(db, 'gallery', id), removeUndefined(sanitizeForFirestore(data)));
};

export const deleteGalleryItemFromDb = async (id: string) => {
  if (!db) return;
  await deleteDoc(doc(db, 'gallery', id));
};

export const subscribeToContent = (callback: (data: Record<string, string>) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'content'), (s) => {
    const data: Record<string, string> = {};
    s.docs.forEach(doc => data[doc.id] = doc.data().url);
    callback(data);
  }, (err) => {
    diagnostics.log('error', 'Content sync error', err);
    if (onError) onError(err);
  });
};

export const updateContentImageInDb = async (key: string, url: string) => {
  if (!db) return;
  await setDoc(doc(db, 'content', key), { url });
};

export const subscribeToPosts = (callback: (items: Post[]) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'posts'), (s) => {
    callback(s.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
  }, (err) => {
    diagnostics.log('error', 'Community sync error', err);
    if (onError) onError(err);
  });
};

export const addPostToDb = async (post: Post) => {
  if (!db) return;
  const { id, ...data } = post;
  await setDoc(doc(db, 'posts', id), removeUndefined(sanitizeForFirestore(data)));
};

export const updatePostInDb = async (post: Post) => {
  if (!db) return;
  const { id, ...data } = post;
  await updateDoc(doc(db, 'posts', id), removeUndefined(sanitizeForFirestore(data)));
};

export const deletePostFromDb = async (id: string) => {
  if (!db) return;
  await deleteDoc(doc(db, 'posts', id));
};

export const uploadMedia = async (input: string | Blob | File, folder = 'uploads', onProgress?: (p: number) => void): Promise<string> => {
  if (!firestorage) {
    diagnostics.log('error', 'uploadMedia: Firebase Storage is not initialized. Upload aborted.');
    throw new Error('Firebase Storage is not initialized');
  }
  
  // NEW: Check if input is already a permanent URL
  if (typeof input === 'string' && 
      !input.startsWith('blob:') && 
      !input.startsWith('data:') &&
      (input.includes('firebasestorage.googleapis.com') || 
       input.includes('cloudinary.com') ||
       input.includes('res.cloudinary.com') ||
       (input.startsWith('https://') && !input.includes('photos.google.com')))) {
    diagnostics.log('info', `uploadMedia: Input is already a permanent URL, skipping upload: ${input.substring(0, 50)}...`);
    onProgress?.(100);
    return input;
  }
  
  diagnostics.log('info', `uploadMedia: Starting upload to folder ${folder}...`);

  let blob: Blob;
  if (typeof input === 'string') {
    const response = await fetch(input);
    blob = await response.blob();
  } else {
    blob = input;
  }

  const parts = blob.type.split('/');
  const ext = parts.length === 2 && parts[1] ? parts[1].split(';')[0] : 'bin';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const storageRef = ref(firestorage, `${folder}/${filename}`);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        diagnostics.log('error', 'uploadMedia: Upload failed', error.message);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          diagnostics.log('success', `uploadMedia: Upload complete. URL: ${downloadURL.substring(0, 50)}...`);
          resolve(downloadURL);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
};

export const uploadImage = (input: string | Blob | File): Promise<string> =>
  uploadMedia(input, 'gallery');

export const generateVideoThumbnail = (videoFile: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    const cleanup = () => URL.revokeObjectURL(objectUrl);
    const seek = () => {
      const duration = video.duration;
      video.currentTime = isFinite(duration) && duration > 0.1 ? Math.min(1, duration * 0.1) : 0;
    };
    video.addEventListener('loadedmetadata', seek, { once: true });
    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) { cleanup(); reject(new Error('Canvas context unavailable')); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          cleanup();
          if (blob) resolve(blob);
          else reject(new Error('Thumbnail generation failed'));
        }, 'image/jpeg', 0.85);
      } catch (e) { cleanup(); reject(e); }
    }, { once: true });
    video.addEventListener('error', (e) => { cleanup(); reject(e); }, { once: true });
    video.load();
  });

export const blobUrlToBase64 = (blobUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

export const runSystemHealthCheck = async (): Promise<HealthCheckResult> => {
  const result: HealthCheckResult = {
    firestore: { status: 'pending', message: 'Checking...' },
    storage: { status: 'pending', message: 'Checking...' },
  };

  if (!db) {
    result.firestore = { status: 'error', message: 'Not initialized' };
  } else {
    try {
      await getDocs(query(collection(db, 'gallery'), limit(1)));
      result.firestore = { status: 'ok', message: 'Connected' };
    } catch (e: any) {
      result.firestore = { status: 'error', message: e.message || 'Read failed' };
    }
  }

  if (!firestorage) {
    result.storage = { status: 'error', message: 'Not initialized' };
  } else {
    try {
      ref(firestorage, 'health-check');
      result.storage = { status: 'ok', message: 'Bucket reachable' };
    } catch (e: any) {
      result.storage = { status: 'error', message: e.message || 'Unreachable' };
    }
  }

  return result;
};