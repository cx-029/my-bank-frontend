const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的后端服务地址
        changeOrigin: true
        // pathRewrite: { '^/api': '' } // 如果后端不需要/api前缀，可以加这行
      }
    }
  }
})