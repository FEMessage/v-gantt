// 相比 @rollup/plugin-typescript，解决了引入虚拟模块的问题
// https://github.com/ezolenko/rollup-plugin-typescript2/issues/78#issuecomment-399524537
import typescript from 'rollup-plugin-typescript2'
// rollup-plugin-vue 依赖很多 commonjs 模块
import commonjs from '@rollup/plugin-commonjs'
// 版本控制在 ^5；6.0.0-beta 无法识别 css block
import vue from 'rollup-plugin-vue'
import bundleSize from 'rollup-plugin-bundle-size'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/v-gantt.common.min.js',
      format: 'cjs',
    },
    {
      file: 'dist/v-gantt.esm.min.js',
      format: 'es',
    },
  ],
  // rollup 默认已经不会打包 npm 模块了，但会有警告⚠️；这里显示声明就不会有警告
  external: [
    'vue',
    'axios',
    'dayjs',
    'dayjs/plugin/isSameOrAfter',
    'dayjs/plugin/isSameOrBefore',
    'lodash.clonedeep',
    'store2',
  ],
  plugins: [commonjs(), typescript(), vue(), bundleSize(), terser()],
}
