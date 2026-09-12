import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sportscore': {
        target: 'https://sportscore.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sportscore/, ''),
      },
      '/api/sofascore': {
        target: 'https://api.sofascore.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sofascore/, ''),
      },
      '/api/thesportsdb': {
        target: 'https://www.thesportsdb.com/api/v1/json/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thesportsdb/, ''),
      },
    },
  },
})
