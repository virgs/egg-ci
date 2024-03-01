import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
      }

    },
    outDir: 'docs',
    assetsDir: '.'
  },
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  server: {
    proxy: {
      "/v1/proxy": {
        target: "http://localhost:23123", // Replace with your API URL
        changeOrigin: true,
        rewrite: (path) => path.replace("/v1/proxy", ""),
      },
      "/v2/proxy": {
        target: "http://localhost:23123", // Replace with your API URL
        changeOrigin: true,
        rewrite: (path) => path.replace("/v2/proxy", ""),
      },
    },
  },
})
