import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/vi/hexagram': 'http://localhost:3000',
        '/zh-TW/hexagram': 'http://localhost:3000',
        '/en/hexagram': 'http://localhost:3000',
        '/hexagram': 'http://localhost:3000',
        '/cards': 'http://localhost:3000',
        '/cards_zh': 'http://localhost:3000',
        '/api': 'http://localhost:8000',
        '/media': 'http://localhost:8000',
      },
    },
  };
});
