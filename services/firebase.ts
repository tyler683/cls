import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
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
let authReady: Promise<void> = Promise.resolve();

if (IS_FIREBASE_CONFIGURED) {
  try {
    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
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

    // Initialize Firebase Auth and sign in anonymously so the SDK has a
    // valid auth token before attempting any Firestore/Storage operations.
    const auth = getAuth(app);
    authReady = new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          unsubscribe();
          diagnostics.log('success', `Firebase Auth ready (uid: ${user.uid})`);
          resolve();
        } else {
          signInAnonymously(auth)
            .then((cred) => {
              diagnostics.log('success', `Signed in anonymously (uid: ${cred.user.uid})`);
            })
            .catch((err: any) => {
              diagnostics.log('warn', 'Anonymous sign-in failed. Syncing without auth.', err.message);
              unsubscribe();
              resolve();
            });
        }
      });
    });
    
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
export const waitForAuth = () => authReady;

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
  
  diagnostics.log('info', `uploadMedia: Starting upload to folder "${folder}"...`);

  let blob: Blob;
  let filename = `${Date.now()}-upload`;

  if (input instanceof File) {
    blob = input;
    filename = `${Date.now()}-${input.name}`;
  } else if (input instanceof Blob) {
    blob = input;
  } else if (input.startsWith('data:')) {
    const [header, data] = input.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteString = atob(data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    blob = new Blob([ab], { type: mime });
    const ext = mime.split('/')[1] || 'bin';
    filename = `${Date.now()}-upload.${ext}`;
  } else if (input.startsWith('blob:')) {
    let response: Response;
    try {
      response = await fetch(input);
    } catch (e) {
      throw new Error(`Failed to fetch blob URL: ${(e as Error).message}`);
    }
    blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'bin';
    filename = `${Date.now()}-upload.${ext}`;
  } else {
    throw new Error('Unsupported input type for upload');
  }

  const storageRef = ref(firestorage, `${folder}/${filename}`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        diagnostics.log('error', `uploadMedia: Upload failed`, error.message);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        diagnostics.log('success', `uploadMedia: Upload complete. URL: ${downloadURL.substring(0, 50)}...`);
        resolve(downloadURL);
      }
    );
  });
};

export const blobUrlToBase64 = (blobUrl: string): Promise<string> =>
  fetch(blobUrl)
    .then(r => r.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

export const runSystemHealthCheck = async (): Promise<HealthCheckResult> => {
  const result: HealthCheckResult = {
    firestore: { status: 'pending', message: 'Checking...' },
    storage: { status: 'pending', message: 'Checking...' },
  };

  if (db) {
    try {
      const q = query(collection(db, 'gallery'), limit(1));
      await getDocs(q);
      result.firestore = { status: 'ok', message: 'Connected and readable.' };
    } catch (e: any) {
      result.firestore = { status: 'error', message: e.message || 'Connection failed.' };
    }
  } else {
    result.firestore = { status: 'error', message: 'Firestore not initialized.' };
  }

  if (firestorage) {
    result.storage = { status: 'ok', message: `Bucket: ${firebaseConfig.storageBucket}` };
  } else {
    result.storage = { status: 'error', message: 'Storage not initialized.' };
  }

  return result;
};

export const uploadImage = (input: string): Promise<string> => uploadMedia(input, 'content');

export const generateVideoThumbnail = (videoFile: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate thumbnail'));
      }, 'image/jpeg', 0.8);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };
    video.load();
  });