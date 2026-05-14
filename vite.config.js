import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg:  { quality: 70, mozjpeg: true },
      jpeg: { quality: 70, mozjpeg: true },
      png:  { quality: 80 },
      webp: { quality: 75 },
      svg:  { multipass: true },
    }),
  ],
  server: {
    port: 3000,
    open: true,
    // Проксируем /api на Express-сервер
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
