
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'build') {
    // Firebase App Hosting provides FIREBASE_WEBAPP_CONFIG at build time instead of
    // individual VITE_* variables. Extract the apiKey so Vite can inline it.
    if (!process.env.VITE_FIREBASE_API_KEY && process.env.FIREBASE_WEBAPP_CONFIG) {
      try {
        const webappConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG) as { apiKey?: string };
        if (webappConfig.apiKey) {
          process.env.VITE_FIREBASE_API_KEY = webappConfig.apiKey;
        }
      } catch {
        console.warn('Warning: Failed to parse FIREBASE_WEBAPP_CONFIG');
      }
    }

    if (!process.env.VITE_FIREBASE_API_KEY) {
      throw new Error(
        '\n\nMissing required environment variable: VITE_FIREBASE_API_KEY\n' +
        'Set it as a GitHub repository secret (Settings → Secrets and variables → Actions).\n' +
        'See DEPLOY.md Step 1 for instructions.\n'
      );
    }
  }

  return {
    plugins: [react()],
    preview: {
      port: 8080,
      host: '0.0.0.0',
    },
  };
})