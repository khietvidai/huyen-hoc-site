import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const norm = id.replace(/\\/g, '/');
            if (norm.includes('node_modules')) {
              if (norm.includes('lucide-react')) return 'vendor-icons';
              if (norm.includes('recharts')) return 'vendor-charts';
              if (norm.includes('firebase')) return 'vendor-firebase';
              if (norm.includes('motion')) return 'vendor-motion';
              return 'vendor';
            }
            if (norm.includes('src/data/yiloreScrapedCatalog')) return 'data-yilore';
            if (norm.includes('src/data/khongMinhBridgeData')) return 'data-khongminh';
            if (norm.includes('src/data/canonical/canonicalPart1') || norm.includes('src/data/canonical/canonicalPart2')) return 'data-canonical-1';
            if (norm.includes('src/data/canonical/canonicalPart3') || norm.includes('src/data/canonical/canonicalPart4')) return 'data-canonical-2';
            if (norm.includes('src/data/hexagrams')) return 'data-hexagrams';
            if (norm.includes('src/data/bookHexagrams')) return 'data-book-hexagrams';
            if (norm.includes('src/data/hanNhietData') || norm.includes('src/data/hanNhietEngine')) return 'data-hannhiet';
            if (norm.includes('src/data/xiangzhuanData')) return 'data-xiangzhuan';
            if (norm.includes('src/components/BaziThucThiThien')) return 'comp-bazi-thucthi';
            if (norm.includes('src/components/JiaziD12Dice')) return 'comp-jiazi-d12';
            if (norm.includes('src/utils/inkWashEngine') || norm.includes('src/utils/inkWashAudio')) return 'util-inkwash';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
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
