import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), nodePolyfills()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          // Suppress sourcemap warnings from third-party packages
          if (warning.code === 'SOURCEMAP_ERROR' || warning.message?.includes('points to missing source files')) {
            return;
          }
          defaultHandler(warning);
        },
        output: {
          // Split large node_modules into focused dynamic chunks
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
          // Each dynamic import chunk must be at least 10 kB (avoids tiny splits)
          experimentalMinChunkSize: 10_000,
        }
      }
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
          '.js': 'jsx'
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
