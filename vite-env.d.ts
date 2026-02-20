/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase web API key — public identifier, safe in client code.
  // Set in .env.local for local dev. In production, set via Firebase App Hosting
  // Console environment variables (not Secret Manager).
  // Value: Firebase Console → Project Settings → Your apps → Web app → apiKey
  readonly VITE_FIREBASE_API_KEY: string;
  // Gemini AI API key — genuinely secret. Set via Firebase Secret Manager
  // secret named GEMINI_API_KEY (declared in apphosting.yaml).
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
