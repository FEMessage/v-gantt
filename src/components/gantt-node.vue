<template>
  <component
    :is="component"
    v-bind="$props"
    :class="[
      'gantt-node',
      {
        moving: dragData.dragging || resizeData.resizing,
        'is-month-view': isMonthView,
        focusing,
        hovering,
      },
    ]"
    :style="style"
    @drag-start="onDragStart"
    @resize-start="onResizeStart"
    @focus-start="startFocus"
    @hover-start="startHover"
    @hover-end="endHover"
  />
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import GanttGroup from './gantt-group.vue'
import GanttLeaf from './gantt-leaf.vue'
import GanttMilestone from './gantt-milestone.vue'
import { GanttLayoutNode, Bus, ColUnit } from '@/utils/types'
import { isGroup, isMilestone } from '@/utils'

interface Style {
  transform: string
  width: string
  height: string
}

function dividedBy(offsetX: number, colW: number) {
  return Math.round(offsetX / colW)
}

export default Vue.extend({
  name: 'GanttNode',
  props: {
    data: {
      type: Object as PropType<GanttLayoutNode>,
      required: true,
    },
    bus: {
      type: Object as PropType<Bus>,
      required: true,
    },
  },
  data: () => ({
    dragData: {
      dragging: false,
      offsetX: 0,
    },
    resizeData: {
      resizing: false,
      offsetX: 0,
    },
    focusing: false,
    hovering: false,
  }),
  computed: {
    component(): Vue.VueConstructor {
      if (isGroup(this.data)) return GanttGroup
      if (isMilestone(this.data)) return GanttMilestone
      return GanttLeaf
    },
    dataInPx(): { x: number; y: number; w: number; h: number } {
      const { rowH, colW } = this.bus
      const { x, y, w, h } = this.data
      const { dragData, resizeData } = this
      // 里程碑中心需要对齐当天最右边，而非中间
      const milestoneOffset = isMilestone(this.data) ? colW / 2 : 0

      return {
        x: x * colW + dragData.offsetX + milestoneOffset,
        y: y * rowH,
        w: Math.max(colW, w * colW + resizeData.offsetX),
        h: h * rowH,
      }
    },
    style(): Style {
      const { x, y, w, h } = this.dataInPx
      return {
        transform: `translate(${x}px, ${y}px)`,
        width: w + 'px',
        height: h + 'px',
      }
    },
    absolutePosition() {
      let { x, y } = (this as any).dataInPx
      const { rowH } = this.bus
      let node: any = this.$parent
      // 统计到顶级 layout 的距离
      while (node.$options.name !== 'GanttChart') {
        if (node.$options.name === 'GanttLayout') {
          y += rowH
        } else if (node.$options.name === 'GanttNode') {
          x += node.dataInPx.x
          y += node.dataInPx.y
        }
        node = node.$parent
      }

      return { x, y }
    },
    isMonthView() {
      return this.bus.colUnit === ColUnit.Month
    },
  },
  created() {
    const { ee } = this.bus
    ee.on(ee.Event.ScrollToNode, (id: string) => {
      if (id !== this.data.id) return
      const { x, y } = this.absolutePosition

      ee.emit(ee.Event.ScrollTo, { x: x - 200, y: y - 150 })
      this.startFocus()
    })
    ee.on(ee.Event.Focus, (id: string) => {
      if (id !== this.data.id) {
        this.blur()
      } else {
        this.focus()
      }
    })
  },
  methods: {
    onDragStart() {
      this.dragData.dragging = true
      this.dragData.offsetX = 0
      const { ee } = this.bus
      ee.emit(ee.Event.DragStart, { id: this.data.id })
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.onDragEnd)
      document.documentElement.classList.add('grabbing')
    },
    onDrag(e: MouseEvent) {
      this.dragData.offsetX += e.movementX
      const { ee } = this.bus
      ee.emit(ee.Event.Drag, {
        movedCols: dividedBy(this.dragData.offsetX, this.bus.colW),
      })
    },
    onDragEnd() {
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.onDragEnd)
      document.documentElement.classList.remove('grabbing')
      this.dragData.dragging = false
      this.dragData.offsetX = 0
      const { ee } = this.bus
      ee.emit(ee.Event.DragEnd)
    },
    onResizeStart() {
      this.resizeData.resizing = true
      this.resizeData.offsetX = 0
      const { ee } = this.bus
      ee.emit(ee.Event.ResizeStart, { id: this.data.id })
      document.addEventListener('mousemove', this.onResize)
      document.addEventListener('mouseup', this.onResizeEnd)
      document.documentElement.classList.add('col-resizing')
    },
    onResize(e: MouseEvent) {
      this.resizeData.offsetX += e.movementX
      const { ee } = this.bus
      ee.emit(ee.Event.Resize, {
        resizedCols: Math.max(
          1 - this.data.w, // 至少一列
          dividedBy(this.resizeData.offsetX, this.bus.colW),
        ),
      })
    },
    onResizeEnd() {
      document.removeEventListener('mousemove', this.onResize)
      document.removeEventListener('mouseup', this.onResizeEnd)
      document.documentElement.classList.remove('col-resizing')
      this.resizeData.resizing = false
      this.resizeData.offsetX = 0
      const { ee } = this.bus
      ee.emit(ee.Event.ResizeEnd)
    },
    /**
     * 通知其他节点 blur & 自身 focus
     */
    startFocus() {
      const { ee } = this.bus
      ee.emit(ee.Event.Focus, this.data.id)
    },
    startHover() {
      // 仅 month 视图开启悬浮显示日期
      if (this.bus.colUnit !== ColUnit.Month) return

      const { ee } = this.bus
      ee.emit(ee.Event.StartHover, {
        id: this.data.id,
        w: this.dataInPx.w,
        ...this.absolutePosition,
      })

      this.hovering = true
    },
    endHover() {
      const { ee } = this.bus
      ee.emit(ee.Event.EndHover)

      this.hovering = false
    },
    focus() {
      this.focusing = true
      document.addEventListener('click', this.blur)
    },
    blur() {
      this.focusing = false
      document.removeEventListener('click', this.blur)
    },
  },
})
</script>
<style lang="less" scoped>
@import '../assets/vars';

.gantt-node {
  will-change: transform;
  position: absolute;
  transition: transform 0.3s ease-in-out, width 0.3s ease-in-out; // 与 el-tree 相同

  &.moving {
    transition: unset;
  }

  &.moving,
  &.focusing,
  &.hovering {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: fade(@progress-background, 30%);
      border: 1px solid fade(@progress-content, 80%);
    }
  }
}
</style>
<style>
.grabbing * {
  cursor: grabbing !important;
}

.col-resizing * {
  cursor: col-resize !important;
}
</style>
