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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'SOURCEMAP_ERROR' || warning.message?.includes('points to missing source files')) {
          return;
        }
        defaultHandler(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@solana') || id.includes('@metaplex') || id.includes('@noble')) {
              return 'chunk-solana';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'chunk-react';
            }
            if (id.includes('lucide')) {
              return 'chunk-icons';
            }
            return 'chunk-vendor';
          }
        },
        experimentalMinChunkSize: 10_000,
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
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
