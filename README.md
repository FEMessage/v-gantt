# v-gantt

[![Build Status](https://badgen.net/travis/FEMessage/v-gantt/master)](https://travis-ci.com/FEMessage/v-gantt)
[![NPM Download](https://badgen.net/npm/dm/@femessage/v-gantt)](https://www.npmjs.com/package/@femessage/v-gantt)
[![NPM Version](https://badgen.net/npm/v/@femessage/v-gantt)](https://www.npmjs.com/package/@femessage/v-gantt)
[![NPM License](https://badgen.net/npm/license/@femessage/v-gantt)](https://github.com/FEMessage/v-gantt/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/FEMessage/v-gantt/pulls)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

![image.png](https://i.loli.net/2020/07/09/SoyCaBGfpNvJP1m.png)

[中文文档](./README-zh.md)

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

Base on vue + element-ui, create web version omniplan。[docs](https://femssage.github.io/v-gantt)

[⬆ Back to Top](#table-of-contents)

## Feature

1. fold & collapse tree node
2. drag gantt node to modify dates
3. drag to modify duration
4. jump to 'today'
5. col unit base on days or weeks
6. click tree node to jump to gantt node
7. click milestone's line to jump to milestone node
8. get chinese festivals by public-api

[⬆ Back to Top](#table-of-contents)

## Quick Start

`v-gantt` is based on `el-button`, `el-select`, `el-progress` and `el-tree`. So you need to register those in global environment with `Vue.component` or simply with `Vue.use(Element)`

```sh
yarn add @femessage/v-gantt element-ui
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

develop on top of vue-styleguide

```sh
yarn dev
```

### Todo

- support tree node dragging
- support header-slot to place button like 'new'
- support delete action
- fix 'rowH' doesn't inpact tree nodes
- support drag to change progress
- support click to toggle milestone

[⬆ Back to Top](#table-of-contents)

## Links

- [design docs](https://deepexi.yuque.com/docs/share/93cf287f-c001-4b18-abcb-ae6fb4d08e33)

[⬆ Back to Top](#table-of-contents)

## Inspiration

thanks to

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
