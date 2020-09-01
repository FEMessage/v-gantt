import EventEmitter from '@/utils/event-emitter'

export interface BaseItem {
  id: string
  name: string
}

export interface BaseGroup extends BaseItem {
  children: BaseNode[]
}

export interface BaseMilestone extends BaseItem {
  done: boolean
}

export type BaseNode = BaseItem | BaseGroup | BaseMilestone

/**
 * prop 类型；外部数据
 */
// TODO: 移除 Gantt 前缀
export interface GanttPropItem extends BaseItem {
  startDate: string
  endDate: string
  progress: number // 0 - 100
}
// REVIEW: 移除 GanttProp 类型，保留 GanttPropGroup => GanttGroupRaw 以示区别
export interface GanttPropGroup extends BaseGroup {
  startDate?: string
  endDate?: string
  progress?: number // 0 - 100
  children: GanttPropData
}

export interface GanttPropMilestone extends BaseMilestone {
  date: string
}

export type GanttPropNode = GanttPropItem | GanttPropGroup | GanttPropMilestone

export type GanttPropData = GanttPropNode[]

/**
 * 转换后的内部数据
 */
// TODO: GanttItem => DataItem
export type GanttItem = GanttPropItem

export interface GanttGroup extends GanttItem, BaseGroup {
  children: GanttData
}

export type GanttMilestone = GanttPropMilestone

export type GanttNode = GanttItem | GanttGroup | GanttMilestone

export type GanttData = GanttNode[]

/**
 * 布局数据
 */
interface BaseLayoutItem {
  x: number
  y: number
  w: number
  h: number
}

// TODO: 移除 Gantt 前缀
export interface GanttLayoutLeaf extends BaseItem, BaseLayoutItem {
  progress: number
}

export interface GanttLayoutGroup extends GanttLayoutLeaf, BaseGroup {
  children: GanttLayoutData
}

export interface GanttLayoutMilestone extends BaseMilestone, BaseLayoutItem {}

export type GanttLayoutNode =
  | GanttLayoutLeaf
  | GanttLayoutGroup
  | GanttLayoutMilestone

export type GanttLayoutData = GanttLayoutNode[]

/**
 * 记录哪些节点处于 collapsed 状态
 */
export interface CollapsedMap {
  [id: string]: boolean
}

/**
 * 公交车🚌定义
 */
export interface Bus {
  rowH: number
  _colW: number
  colW: number
  colUnit: ColUnit

  collapsedMap: CollapsedMap

  ee: EventEmitter
}

export enum ColUnit {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}
