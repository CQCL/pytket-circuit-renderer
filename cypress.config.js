const { defineConfig } = require('cypress')
const webpack = require('webpack')

module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'vue-cli',
      bundler: 'webpack',
      webpackConfig: {
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
          })
        ],
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            zlib: require.resolve('browserify-zlib'),
            path: require.resolve('path-browserify'),
            buffer: require.resolve('buffer/')
          }
        }
      }
    }
  }
})
