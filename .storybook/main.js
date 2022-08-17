const path = require('path')
const vueBaseConfig = require('@vue/cli-service/webpack.config.js')

module.exports = {
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src/')
    }
    return { ...config, module: { ...config.module, rules: vueBaseConfig.module.rules } }
  },
  // Copy the vue config edits over here also.
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compilerOptions = {
          ...options.compilerOptions,
          delimiters: ['[[#', '#]]']
        }
        return options
      })
  },
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: '@storybook/vue3',
  core: {
    builder: '@storybook/builder-webpack5'
  }
}
