const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/live': {
        target: 'https://cntv.sbs',
        changeOrigin: true,
        pathRewrite: {
          '^/live': '/live'
        }
      }
    }
  }
})
