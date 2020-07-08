<template>
  <el-progress
    :class="['gantt-progress', type]"
    :stroke-width="strokeWidth"
    :percentage="progress"
    :show-text="false"
    v-bind="$attrs"
  />
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
export default Vue.extend({
  name: 'GanttProgress',
  props: {
    progress: {
      type: Number,
      required: true,
    },
    strokeWidth: {
      type: Number,
      default: 16,
    },
    type: {
      type: String as PropType<'leaf' | 'group'>,
      default: 'leaf',
    },
  },
})
</script>
<style lang="less" scoped>
@import '../assets/vars';

.gantt-progress {
  /deep/ .el-progress-bar__outer {
    border: 1px solid @progress-content;
    border-radius: 3px;
    background-color: @progress-background;

    .el-progress-bar__inner {
      border-radius: 0; // 要比容器直，才能填满空间
      background-color: @progress-content;
    }
  }

  &.group {
    position: relative;

    // 制造多边形
    /deep/ .el-progress-bar,
    &::before {
      // 多边形数值来自 ones-plan
      clip-path: polygon(
        100% 0,
        100% 100%,
        calc(100% - 8px) 60%,
        8px 60%,
        0 100%,
        0 0
      );
    }

    // clip 完会缺下边框。通过将 ::before 下移模拟
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: -1.5px; // 目测 1.5 才有 1px 的效果
      left: 0;
      background-color: @progress-content;
    }

    /deep/ .el-progress-bar__outer {
      border-radius: 0;
    }
  }
}
</style>
