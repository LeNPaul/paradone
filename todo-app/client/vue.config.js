const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '../server/public'),
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      title: 'Paradone',
    }
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:5000/api',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: { '^/api': '/' },
      },
    },
  },
}
