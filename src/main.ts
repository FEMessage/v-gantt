import { PluginFunction } from 'vue'
import Component from './index.vue'

// @ts-ignore
Component.install = ((vue) => {
  // @ts-ignore
  vue.component(Component.options.name, Component)
}) as PluginFunction<undefined>

export default Component
