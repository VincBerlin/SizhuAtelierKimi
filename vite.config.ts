import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [
    // Dev-only inspector: it injects data-* attributes into every element.
    // Never ship it to production — bloats the bundle and the DOM.
    ...(command === 'serve' ? [inspectAttr()] : []),
    react(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split large, stable vendor libraries into their own long-cacheable chunks
    // so a route change or app update doesn't force a re-download of everything.
    rollupOptions: {
      output: {
        // Pin the always-needed React runtime into one stable, long-cacheable
        // chunk. A function (not array) form is required so react-dom + scheduler
        // are actually captured — the array form left react-dom in the per-deploy
        // entry chunk, churning its cache on every release.
        // Three.js is deliberately excluded: it stays behind the dynamic import
        // (lazy Home -> lazy InkWave), so Rollup keeps it out of the entry and
        // Vite never modulepreloads it — it loads only when the hero mounts.
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
            return 'react-vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
}));
