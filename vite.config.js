import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    entries: ['index.html', 'src/main.jsx'],
  },
  server: {
    watch: {
      ignored: ['**/Adminpanel/**'],
    },
    // Use VITE_API_BASE_URL=/api so requests hit the local backend during dev.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
