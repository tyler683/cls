// Firebase API keys are public identifiers — safe to embed in client code.
// Security is enforced by Firestore & Storage Rules, not by hiding this key.
// Get your apiKey from: Firebase Console → Project Settings → Your apps → Web app
// For local development, set VITE_FIREBASE_API_KEY in a .env.local file (see .env.example).
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: "gen-lang-client-0068569341.firebaseapp.com",
  projectId: "gen-lang-client-0068569341",
  storageBucket: "gen-lang-client-0068569341.firebasestorage.app",
  messagingSenderId: "589594676736",
  appId: "1:589594676736:web:48778aef09485eec3712e5",
  measurementId: "G-R8M79P4YQQ"
};

export const IS_FIREBASE_CONFIGURED = 
  Boolean(firebaseConfig.apiKey) && 
  Boolean(firebaseConfig.projectId);
