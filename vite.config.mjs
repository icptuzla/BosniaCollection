import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'SOURCEMAP_ERROR' || warning.message?.includes('points to missing source files')) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
  optimizeDeps: {
    exclude: [
      'vite-plugin-node-polyfills/shims/global',
      'vite-plugin-node-polyfills/shims/buffer',
      'workbox-cacheable-response',
      'workbox-expiration',
      'workbox-precaching',
      'workbox-range-requests',
      'workbox-routing',
      'workbox-strategies',
    ],
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
}));
