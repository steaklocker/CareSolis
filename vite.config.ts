import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '/utils': path.resolve(__dirname, './utils'),
    },
    // Deduplicate React instances to prevent "multiple renderers" errors
    dedupe: ['react', 'react-dom', 'react-router'],
  },
  optimizeDeps: {
    // Force specific dependencies to be pre-bundled
    include: ['react', 'react-dom', 'react-router'],
    // Exclude problematic dependencies that might cause conflicts
    exclude: [],
  },
  build: {
    // Improve compatibility with Figma's iframe environment
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})