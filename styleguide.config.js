/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const glob = require('glob')

module.exports = {
  pagePerSection: true,
  ribbon: {
    url: 'https://github.com/FEMessage/v-gantt',
  },
  require: ['./styleguide.config.extra.js'],
  sections: [
    {
      name: 'Components',
      components: 'src/index.vue',
    },
    {
      name: 'Demo',
      sections: glob
        .sync('docs/*.md')
        .map((p) => ({ name: path.basename(p, '.md'), content: p })),
    },
  ],
  // webpackConfig: {
  //   // custom config goes here
  // },
  exampleMode: 'expand',
}
