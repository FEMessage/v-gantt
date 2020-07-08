module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
    externals: {
      axios: 'commonjs axios',
      dayjs: 'commonjs dayjs',
      'lodash.clonedeep': 'commonjs lodash.clonedeep',
      store2: 'commonjs store2',
    },
  },
}
