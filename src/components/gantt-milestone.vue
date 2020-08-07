<template>
  <div
    class="gantt-milestone"
    @mousedown.stop="$emit('drag-start', $event)"
    @click.stop="$emit('focus-start')"
  >
    <div v-if="data.done" class="content done">
      <svg class="icon" viewBox="0 0 16 16" fill="white">
        <path
          d="M5.536 11.175L2 7.639l1.497-1.497L7 9.642l6-6.28 1.497 1.497-7.464 7.814-1.497-1.497z"
        ></path>
      </svg>
    </div>
    <div v-else class="content"></div>
    <div class="name" :title="data.name">{{ data.name }}</div>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { GanttLayoutMilestone } from '@/utils/types'

export default Vue.extend({
  name: 'GanttMilestone',
  props: {
    data: {
      type: Object as PropType<GanttLayoutMilestone>,
      required: true,
    },
  },
})
</script>
<style lang="less" scoped>
@import '../assets/vars';

.gantt-milestone {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;

  &.moving,
  &.focusing {
    &::before {
      display: none;
    }
  }

  .content {
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
    background-color: @progress-background;
    border: 1px solid @progress-content;
    border-radius: 3px;

    &.done {
      background-color: @done;
      border-color: @done;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        transform: rotate(-45deg);
        width: 12px;
      }
    }
  }

  .name {
    position: absolute;
    top: calc(50% - 6px);
    left: calc(50% + 15px);
    width: 200px;
    font-size: 12px;
    line-height: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: none;
  }
}
</style>
