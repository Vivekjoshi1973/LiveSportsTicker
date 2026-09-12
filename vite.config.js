import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sportscore': {
        target: 'https://sportscore.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sportscore/, ''),
      },
      '/sofascore': {
        target: 'https://api.sofascore.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sofascore/, ''),
      },
      '/thesportsdb': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/thesportsdb/, ''),
      },
    },
  },
})
