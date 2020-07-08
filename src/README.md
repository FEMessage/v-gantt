#### 数据类型定义（TypeScript）

```ts
interface GanttPropItem {
  id: string
  name: string
  startDate: string
  endDate: string
  progress: number // 0 - 100
}

interface GanttPropGroup {
  id: string
  name: string
  children: GanttPropData
  startDate?: string
  endDate?: string
  progress?: number // 0 - 100
}

interface GanttPropMilestone {
  id: string
  name: string
  date: string
  done: boolean
}

type GanttPropNode = GanttPropItem | GanttPropGroup | GanttPropMilestone

type GanttPropData = GanttPropNode[]
```
