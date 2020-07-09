module.exports = {
  css: {
    extract: false,
  },
  productionSourceMap: false,
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.output.libraryExport = 'default'
      config.externals = {
        axios: 'commonjs axios',
        dayjs: 'commonjs dayjs',
        'lodash.clonedeep': 'commonjs lodash.clonedeep',
        store2: 'commonjs store2',
      }
    }
  },
}
