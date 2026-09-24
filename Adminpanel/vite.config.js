import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    {
      name: 'admin-redirect-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin') {
            res.statusCode = 302
            res.setHeader('Location', '/admin/')
            res.end()
            return
          }
          next()
        })
      },
    },
  ],
})

