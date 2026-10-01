import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // scripts/prerender.mjs reads this to emit a modulepreload for whichever
    // page chunk a given route needs.
    manifest: true,
    // One stylesheet for the whole site. With per-chunk CSS the lazy route
    // chunks would carry their own, and the prerendered HTML would paint
    // unstyled until those arrived.
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Dependencies change far less often than the site does; keeping them
        // in their own chunk means a copy edit does not invalidate them.
        manualChunks: (id) => (id.includes('node_modules') ? 'vendor' : undefined),
      },
    },
  },
})
