
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'build') {
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
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