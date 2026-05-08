import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/admin': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/business': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/tickets': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/ai': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/notifications': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
    },
  },
})
