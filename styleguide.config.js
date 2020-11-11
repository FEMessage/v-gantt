/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const glob = require('glob')

const sections = (() => {
  const docs = glob
    .sync('docs/*.md')
    .map((p) => ({ name: path.basename(p, '.md'), content: p }))
  const demos = []
  let faq = '' // 约定至多只有一个faq.md
  const guides = []
  docs.forEach((d) => {
    if (/^faq$/i.test(d.name)) {
      d.name = d.name.toUpperCase()
      faq = d
    } else if (/^guide-/.test(d.name)) {
      guides.push(d)
    } else {
      demos.push(d)
    }
  })
  return [
    {
      name: 'Components',
      components: 'src/index.vue',
      usageMode: 'expand',
    },
    {
      name: 'Demo',
      sections: demos,
      sectionDepth: 2,
    },
    ...(faq ? [faq] : []),
    ...(guides.length ? [{ name: 'Guide', sections: guides }] : []),
  ]
})()

module.exports = {
  title: 'v-gantt 文档',
  styleguideDir: 'docs',
  version: require('./package.json').version,
  pagePerSection: true,
  ribbon: {
    url: 'https://github.com/FEMessage/v-gantt',
  },
  require: ['./styleguide.config.extra.js'],
  sections,
  exampleMode: 'expand',
  dangerouslyUpdateWebpackConfig(webpackConfig) {
    /**
     * @see https://vue-styleguidist.github.io/Configuration.html#dangerouslyupdatewebpackconfig
     *
     * 官方不推荐使用这个方法，因为随意修改 webpack 配置可能导致 styleguidist 无法正常运行
     * 但由于每次构建都删除 docs 下的所有文件，且不支持自定义 CleanWebpackPlugin 选项
     * 最终只能采用这种方式，使它构建时不删除 .md 文件
     */
    if (webpackConfig.plugins) {
      for (const plugin of webpackConfig.plugins) {
        const isCleanWebpackPlugin = 'cleanOnceBeforeBuildPatterns' in plugin

        if (!isCleanWebpackPlugin) continue

        const isCleanAll = plugin.cleanOnceBeforeBuildPatterns.includes('**/*')

        if (isCleanAll) {
          plugin.cleanOnceBeforeBuildPatterns.push('!*.md')
        }
      }
    }

    return webpackConfig
  },
}
