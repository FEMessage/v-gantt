import {
  GanttPropData,
  GanttData,
  GanttItem,
  CollapsedMap,
  GanttPropNode,
  Bus,
  GanttNode,
  ColUnit,
} from './utils/types'
import Vue, { VueConstructor, PropType } from 'vue'

declare module '@femessage/v-gantt' {
  class FemessageComponent extends Vue {
    static install(vue: typeof Vue): void
  }

  type CombinedVueInstance<
    Instance extends Vue,
    Data,
    Methods,
    Computed,
    Props
  > = Data & Methods & Computed & Props & Instance

  type ExtendedVue<
    Instance extends Vue,
    Data,
    Methods,
    Computed,
    Props
  > = VueConstructor<
    CombinedVueInstance<Instance, Data, Methods, Computed, Props> & Vue
  >

  type Combined<Data, Methods, Computed, Props> = Data &
    Methods &
    Computed &
    Props

  type VGanttData = {
    collapsedMap: CollapsedMap

    scrollTop: number

    dragData: {
      node: null | GanttNode
      movedCols: number
    }

    resizeData: {
      node: null | GanttNode
      resizedCols: number
    }

    bus: Bus
  }

  type VGanttMethods = {
    initBus: () => void

    onDelete: ({
      id,
      done,
    }: {
      id: GanttPropNode['id']
      done: Function
    }) => void

    onMove: ({
      id,
      pid,
      index,
      done,
    }: {
      id: GanttPropNode['id']
      pid?: GanttPropNode['id']
      index: number
      done: Function
    }) => void

    onDragStart: ({ id }: { id: GanttItem['id'] }) => void

    onDrag: ({ movedCols }: { movedCols: number }) => void

    onDragEnd: () => void

    onResizeStart: ({ id }: { id: GanttItem['id'] }) => void

    onResize: ({ resizedCols }: { resizedCols: number }) => void

    onResizeEnd: () => void
  }

  type VGanttComputed = {
    ganttData: GanttData
  }

  type VGanttProps = {
    rowH: number

    colW: number

    data: PropType<GanttPropData>

    view: PropType<ColUnit>

    treeAttrs: { [key: string]: any }
  }

  type VGantt = Combined<VGanttData, VGanttMethods, VGanttComputed, VGanttProps>

  export interface VGanttType extends FemessageComponent, VGantt {}

  const VGanttConstruction: ExtendedVue<
    Vue,
    VGanttData,
    VGanttMethods,
    VGanttComputed,
    VGanttProps
  >

  export default VGanttConstruction
}
