import store from 'store2'
import {
  BaseGroup,
  BaseMilestone,
  BaseNode,
  GanttPropGroup,
  GanttGroup,
  GanttPropItem,
} from '@/utils/types'

/**
 * 判断是否是群组节点（不支持空群组节点）
 */
export function isGroup<T = BaseGroup>(d: any): d is T {
  return d.children && d.children.length
}

/**
 * 判断是否是里程碑节点
 */
export function isMilestone<T = BaseMilestone>(d: any): d is T {
  return 'done' in d
}

/**
 * 检索节点，同时返回其父节点
 */
export function search(
  id: BaseGroup['id'],
  data: BaseNode[],
  parent?: BaseGroup,
): [BaseNode?, BaseGroup?] {
  for (const d of data) {
    if (id === d.id) return [d, parent]
    if (isGroup(d)) {
      const result = search(id, d.children, d)
      if (result.length) return result
    }
  }
  return []
}

/**
 * 原地改造，方便使用，不需要再找其父节点去替换
 */
export function transformGroupToItem(
  group: GanttPropGroup,
  { startDate }: GanttGroup,
) {
  Object.assign(group, {
    startDate,
    endDate: startDate,
    progress: 0,
  })
  delete group.children
}

/**
 * 原地改造，方便使用，不需要再找其父节点去替换
 */
export function transformItemToGroup(item: GanttPropItem) {
  Object.assign(item, {
    children: [],
  })
}

/**
 * 缓存相同参数的结果到 localStorage
 */
export function cachedAsync<T extends Function>(func: T) {
  // 缓存 promise，重复请求返回相同 promise
  const promises: { [key: string]: Promise<any> } = {}
  return (function(this: any, ...args: any[]) {
    const key = JSON.stringify(args)
    if (store.has(key)) {
      return store.get(key)
    } else if (promises[key]) {
      return promises[key]
    } else {
      promises[key] = func.apply(this, args).then((v: any) => {
        store.set(key, v)
        delete promises[key]
        return v
      })
      return promises[key]
    }
  } as unknown) as T
}
