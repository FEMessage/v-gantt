module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
  },
  chainWebpack: (config) => {
    // 内联图片
    // TODO: 考察 vue-svg-loader
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule.use('svg-inline-loader').loader('svg-inline-loader')
  },
}
