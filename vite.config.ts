
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    plugins: [react()],
    preview: {
      port: 8080,
      host: '0.0.0.0',
    },
  };
})