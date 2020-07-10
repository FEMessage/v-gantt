# v-gantt

[![Build Status](https://badgen.net/travis/FEMessage/v-gantt/master)](https://travis-ci.com/FEMessage/v-gantt)
[![NPM Download](https://badgen.net/npm/dm/@femessage/v-gantt)](https://www.npmjs.com/package/@femessage/v-gantt)
[![NPM Version](https://badgen.net/npm/v/@femessage/v-gantt)](https://www.npmjs.com/package/@femessage/v-gantt)
[![NPM License](https://badgen.net/npm/license/@femessage/v-gantt)](https://github.com/FEMessage/v-gantt/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/FEMessage/v-gantt/pulls)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

![image.png](https://i.loli.net/2020/07/09/SoyCaBGfpNvJP1m.png)

## Table of Contents

- [Introduction](#introduction)
- [Feature](#feature)
- [Quick Start](#quick-start)
- [Development](#development)
  - [Todo](#todo)
- [Links](#links)
- [Inspiration](#inspiration)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

## Introduction

甘特图组件。基于 vue + element-ui，打造 web 版 omniplan。[在线文档](https://femssage.github.io/v-gantt)

[⬆ Back to Top](#table-of-contents)

## Feature

1. 折叠、展开树节点
2. 整体拖拽甘特图节点
3. 拖拽甘特图节点右侧，可以更改持续时间
4. 点击【今天】按钮，快速跳转到今天列
5. 点击【天】按钮，可切换至【周】视图（可配置默认视图）
6. 点击树节点，跳转到该甘特图节点
7. 点击里程碑线，跳转到里程碑行
8. 通过公共 api 获取中国节假日信息

[⬆ Back to Top](#table-of-contents)

## Quick Start

`v-gantt` 依赖了 `el-button`、`el-select`、`el-progress` 和 `el-tree` 组件。请在全局环境使用 `Vue.component` or `Vue.use(Element)` 注册 element 组件

```sh
yarn add @femessage/v-gantt @femessage/element-ui
```

```html
<template>
  <v-gantt style="height: 400px;" :data.sync="data" />
</template>

<script>
  export default {
    data() {
      const y = new Date().getFullYear()
      const m = `${new Date().getMonth() + 1}`.padStart(2, 0)
      const d = (date) => `${y}-${m}-${date}`
      return {
        data: [
          {
            id: 'group-1',
            name: '群组-1',
            children: [
              {
                id: 'item-1',
                name: '叶节点-1',
                progress: 30,
                startDate: d('06'),
                endDate: d('07'),
              },
            ],
          },
          {
            id: 'milestone-1',
            name: '里程碑-1',
            date: d('10'),
            done: true,
          },
        ],
      }
    },
  }
</script>
```

## Development

在 vue-styleguide 环境进行功能开发及维护。

```sh
yarn dev
```

### Todo

- 支持拖拽树节点
- 支持 header-slot，可以在树节点上方放置自定义按钮，如【新增】
- 支持删除节点
- 修复更改 rowH 时未改变树节点高度的问题
- 支持进度修改功能
- 支持修改里程碑完成状态
- 修复使用 rollup 打包时，<gantt-group> 组件丢失对 <gantt-layout> 的引用的问题

[⬆ Back to Top](#table-of-contents)

## Links

- [设计文档](https://deepexi.yuque.com/docs/share/93cf287f-c001-4b18-abcb-ae6fb4d08e33)

[⬆ Back to Top](#table-of-contents)

## Inspiration

功能实现和 ui 参考了

- [ones-plan](https://ones.ai/plan.html)
- [omniplan](https://www.omnigroup.com/omniplan/)

[⬆ Back to Top](#table-of-contents)

## Contributing

For those who are interested in contributing to this project, such as:

- report a bug
- request new feature
- fix a bug
- implement a new feature

Please refer to our [contributing guide](https://github.com/FEMessage/.github/blob/master/CONTRIBUTING.md).

[⬆ Back to Top](#table-of-contents)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

[⬆ Back to Top](#table-of-contents)

## License

[MIT](./LICENSE)

[⬆ Back to Top](#table-of-contents)
