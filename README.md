# v-gantt

## Table of Contents

- [Introduction](#introduction)
- [Feature](#feature)
- [Quick Start](#quick-start)
  - [组件开发](#组件开发)
- [Todo](#todo)
  - [stylelint](#stylelint)
  - [rollup](#rollup)

## Introduction

甘特图组件。ui 基于 element-ui。风格参考 ones-plan & omniplan。[文档](https://femssage.github.io/v-gantt)

## Feature

1. 折叠、展开树节点
2. 整体拖拽甘特图节点
3. 拖拽甘特图节点右侧，可以更改持续时间
4. 点击【今天】按钮，快速跳转到今天列
5. 点击【天】按钮，可切换至【周】视图（可配置默认视图）
6. 点击树节点，跳转到该甘特图节点
7. 点击里程碑线🧵，跳转到里程碑行
8. 通过公共 api 获取中国节假日信息

## Quick Start
使用时，在项目引入即可

```sh
yarn add @femessage/v-gantt
```

```html
<template>
  <v-gantt style="height: 400px" :data.sync="data" />
</template>

<script>
export default {
  data() {
    const y = new Date().getFullYear()
    const m = `${new Date().getMonth() + 1}`.padStart(2, 0)
    const d = date => `${y}-${m}-${date}`
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
          ]
        },
        {
          id: 'milestone-1',
          name: '里程碑-1',
          date: d('10'),
          done: true,
        },
      ]
    }
  },
}
</script>
```

### 组件开发
在 vue-styleguide 环境进行功能开发及维护。

```sh
yarn dev
```

## Todo

### rollup

为了支持打包 esm 模块和更小的包体积，可以继续尝试。下面是已经尝试过的失败配置。

```js
// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import vue from 'rollup-plugin-vue'

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/v-gantt.common.min.js',
    format: 'esm',
  },
  external: ['vue'],
  plugins: [typescript(), vue()],
}
```

### ci

包含：
1. husky & lint-staged，提交前代码检查
   1. stylelint
   2. commitlint
   3. eslint --fix
2. travis-ci，包括
   1. standard-version，生成 semver
   2. 代码发包到 npm
   3. 文档发布到 github page
   4. 生成 release-note 到 github
   5. 发通知到钉钉
