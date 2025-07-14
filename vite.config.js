import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 只要以 /api 开头的请求，都会被转发到后端
      '/api': {
        target: 'http://localhost:8080',  // 你的后端端口
        changeOrigin: true,
        // 如果你的后端 /api 路径也有 /api，则不用 rewrite。否则打开注释：
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    }
  }
})