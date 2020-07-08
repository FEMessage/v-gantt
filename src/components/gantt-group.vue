<template>
  <div class="gantt-group">
    <div
      class="self-content"
      :style="contentStyle"
      @mousedown.stop="$emit('drag-start', $event)"
      @click.stop="$emit('focus-start')"
    >
      <gantt-progress :progress="data.progress" type="group" />
    </div>
    <transition>
      <gantt-layout v-show="showChildren" :data="data.children" :bus="bus" />
    </transition>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { GanttLayoutGroup, Bus } from '@/utils/types'
import GanttProgress from './gantt-progress.vue'

export default Vue.extend({
  name: 'GanttGroup',
  components: { GanttProgress },
  props: {
    data: {
      type: Object as PropType<GanttLayoutGroup>,
      required: true,
    },
    bus: {
      type: Object as PropType<Bus>,
      required: true,
    },
  },
  computed: {
    showChildren(): boolean {
      return !this.bus.collapsedMap[this.data.id]
    },
    contentStyle(): { height: string } {
      return {
        height: this.bus.rowH + 'px',
      }
    },
    borderStyle(): { top: string; bottom: string } {
      const half = this.bus.rowH / 2 + 'px'
      return {
        top: half,
        bottom: half,
      }
    },
  },
  beforeCreate() {
    this.$options.components!.GanttLayout = require('./gantt-layout.vue').default
  },
})
</script>
<style lang="less" scoped>
.gantt-group {
  display: flex;
  flex-direction: column;
  @borderColor: rgb(25, 104, 206);

  .self-content {
    display: flex;
    align-items: center;
    cursor: grab;

    .gantt-progress {
      flex: 1 0 0;
    }
  }

  .gantt-layout {
    flex: 1 0 0;
  }

  .v-enter,
  .v-leave-to {
    opacity: 0;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.3s;
  }
}
</style>
