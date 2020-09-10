/**
 * 组件内全局通信机制
 */
export enum GanttEvent {
  ResizeStart,
  Resize,
  ResizeEnd,
  DragStart,
  Drag,
  DragEnd,
  ChangeColUnit,
  ScrollToNode,
  ScrollTo,
  Focus,
  StartHover,
  EndHover,
}

/**
 * 从内存上讲应该不需要手动取消监听 handler。因为只要 EventEmitter 实例未被引用了，其下资源会自动被回收♻️
 */
export default class EventEmitter {
  Event = GanttEvent

  private handlersMap = {} as Record<GanttEvent, Function[]>

  private getHandlers(event: GanttEvent) {
    if (!this.handlersMap[event]) this.handlersMap[event] = []
    return this.handlersMap[event]
  }

  on(event: GanttEvent, handler: Function) {
    const handlers = this.getHandlers(event)
    handlers.push(handler)
    return () => {
      const i = handlers.indexOf(handler)
      if (i > -1) handlers.splice(i, 1)
    }
  }

  emit(event: GanttEvent, ...args: any) {
    const handlers = this.getHandlers(event)
    handlers.forEach((handler) => handler(...args))
  }
}
