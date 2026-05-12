import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',  // ← wajib agar bisa diakses dari luar container
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://php:8000',  // ← nama service Docker, bukan localhost
        changeOrigin: true,
      }
    }
  }
})