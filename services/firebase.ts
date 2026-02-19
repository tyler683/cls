
import * as firebaseApp from 'firebase/app';
const { initializeApp, getApp, getApps } = firebaseApp as any;
import { 
  initializeFirestore, 
  getFirestore,
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
        if (key.startsWith('_') || typeof val === 'function') continue;
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
  await setDoc(doc(db, 'gallery', id), sanitizeForFirestore(data));
};

export const updateGalleryItemInDb = async (item: GalleryItem) => {
  if (!db) return;
  const { id, ...data } = item;
  await updateDoc(doc(db, 'gallery', id), sanitizeForFirestore(data));
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
  await setDoc(doc(db, 'posts', id), sanitizeForFirestore(data));
};

export const updatePostInDb = async (post: Post) => {
  if (!db) return;
  const { id, ...data } = post;
  await updateDoc(doc(db, 'posts', id), sanitizeForFirestore(data));
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
  diagnostics.log('info', `uploadMedia: Starting upload to folder "${folder}"`);
  try {
    let blob: Blob;
    if (input instanceof Blob) {
      blob = input;
      diagnostics.log('info', `uploadMedia: Input is a ${input instanceof File ? 'File' : 'Blob'} (${blob.size} bytes)`);
    } else if (input.startsWith('blob:')) {
      diagnostics.log('info', 'uploadMedia: Input is a blob URL, fetching...');
      blob = await (await fetch(input)).blob();
    } else if (input.startsWith('data:')) {
      diagnostics.log('info', 'uploadMedia: Input is a data URL, converting to blob...');
      blob = await (await fetch(input)).blob();
    } else {
      diagnostics.log('info', 'uploadMedia: Input is a URL, fetching...');
      blob = await (await fetch(input)).blob();
    }
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    diagnostics.log('info', `uploadMedia: Uploading to path "${filename}"`);
    const storageRef = ref(firestorage, filename);
    const task = uploadBytesResumable(storageRef, blob);
    return new Promise((res, rej) => {
      task.on('state_changed', (s) => onProgress?.((s.bytesTransferred / s.totalBytes) * 100), (err) => {
        diagnostics.log('error', 'uploadMedia: Upload failed', err.message);
        rej(err);
      }, async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          diagnostics.log('success', `uploadMedia: Upload complete. URL: ${url}`);
          res(url);
        } catch (err: any) {
          diagnostics.log('error', 'uploadMedia: Failed to get download URL', err.message);
          rej(err);
        }
      });
    });
  } catch (e: any) {
    diagnostics.log('error', 'uploadMedia: Upload error', e.message);
    throw e;
  }
};

export const uploadImage = (url: string) => uploadMedia(url, 'uploads');

export const generateVideoThumbnail = async (videoFile: File | string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.autoplay = false;
    video.muted = true;
    if (typeof videoFile === 'string') video.crossOrigin = "anonymous";
    video.src = typeof videoFile === 'string' ? videoFile : URL.createObjectURL(videoFile);
    video.onloadeddata = () => { video.currentTime = 1; };
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("No canvas"));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Blob failed"));
        }, 'image/jpeg', 0.7);
      } catch (err) { reject(err); }
    };
    video.onerror = () => reject(new Error("Video load failed"));
  });
};

export const runSystemHealthCheck = async (): Promise<HealthCheckResult> => {
  const res: HealthCheckResult = {
    firestore: { status: 'pending', message: 'Checking...' },
    storage: { status: 'pending', message: 'Checking...' }
  };
  if (!db) {
    res.firestore = { status: 'error', message: 'Not initialized.' };
    res.storage = { status: 'error', message: 'Storage unavailable.' };
    return res;
  }
  try {
    await getDocs(query(collection(db, 'gallery'), limit(1)));
    res.firestore = { status: 'ok', message: 'Connected.' };
  } catch (e: any) {
    res.firestore = { status: 'error', message: `Error: ${e.code || e.message}` };
  }
  res.storage = firestorage ? { status: 'ok', message: 'Ready.' } : { status: 'error', message: 'No bucket.' };
  return res;
};

export const blobUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
