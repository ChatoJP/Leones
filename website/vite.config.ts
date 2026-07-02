import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:4242',
    },
    watch: {
      // the API server writes its SQLite db here on every request —
      // watching it would put the dev server in a reload loop
      ignored: ['**/server/**'],
    },
  },
})
