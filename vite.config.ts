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
        // Only force the always-needed React runtime into a stable vendor chunk.
        // Three.js is intentionally NOT listed: it lives behind a dynamic import
        // (lazy Home -> lazy InkWave), so Rollup splits it on its own and Vite
        // does NOT modulepreload it from index.html — it loads only on Home.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
}));
