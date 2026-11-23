import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kasetfair/',
  server: {
    host: true,
    proxy: {
      '/kasetfair/api': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Suppress proxy error noise when backend is not running
          });
        }
      }
    }
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
  }
})
