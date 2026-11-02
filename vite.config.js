import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflareR2VitePlugin } from './src/lib/viteR2Plugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      cloudflareR2VitePlugin(env)
    ],
    server: {
      port: 5173,
      open: true
    }
  };
});
