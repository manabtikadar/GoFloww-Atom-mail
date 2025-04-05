import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      // All API calls starting with `/api` will be proxied to your backend
      '/api': {
        target: 'http://localhost:5000', // Change this to your backend URL & port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
