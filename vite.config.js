import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/php': {
        target: 'http://localhost:8085/aguitourslascapullanas',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
