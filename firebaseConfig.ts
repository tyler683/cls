// Firebase API keys are public identifiers — safe to embed in client code.
// Security is enforced by Firestore & Storage Rules, not by hiding this key.
export const firebaseConfig = {
  apiKey: 'AIzaSyCvN4f69X2pOifhEOjgju_gUEfWHh4QQpY',
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
