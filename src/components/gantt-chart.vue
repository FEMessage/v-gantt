<template>
  <div class="gantt-chart">
    <div ref="xScrollContainer" class="x-scroll-container">
      <section class="content" :style="contentStyle">
        <header>
          <section v-if="monthMode" class="months">
            <div
              v-for="m in months"
              :key="m"
              :class="[
                'month',
                {
                  // month 视图实现跳转到今天，实际上只需要跳到当前月即可
                  'date today': isCurrentMonth(m),
                },
              ]"
              :style="monthStyle(m)"
            >
              {{ m }}
            </div>
          </section>
          <section v-else-if="weekMode" class="weeks">
            <div v-for="w in weeks" :key="w" class="week">{{ w }}</div>
          </section>
          <section class="dates" v-if="dayMode || weekMode">
            <div
              v-for="d in dates"
              :key="d"
              :class="[
                'date',
                {
                  rest: isRestDay(d),
                  today: isToday(d),
                  'on-drop': dragPosition.has(d),
                  milestone: d in milestoneMap,
                  done: milestoneMap[d] && milestoneMap[d].done,
                },
              ]"
            >
              <span :title="d">{{ getDayContent(d) }}</span>
              <template v-if="dayMode">
                <span v-if="isToday(d)" class="desc">今天</span>
                <span v-else-if="isRestDay(d)" class="desc">{{
                  getDesc(d)
                }}</span>
              </template>
              <template v-else-if="weekMode">
                <span class="date-in-month">{{ d.slice(-2) }}</span>
              </template>
              <div
                v-if="d in milestoneMap"
                class="milestone-line"
                @click="scrollToMilestone(milestoneMap[d].id)"
              ></div>
            </div>
          </section>
          <div
            :class="[
              'hovering-node-date',
              { 'is-milestone': hoveringNode.date.length === 1 },
            ]"
            v-if="hoveringNode.visible"
            :style="hoveringNodeStyle"
          >
            <span v-for="d in hoveringNode.date" :key="d">{{
              d | formatDate
            }}</span>
          </div>
        </header>
        <div
          ref="yScrollContainer"
          class="y-scroll-container"
          @scroll="onScroll"
        >
          <gantt-layout :data="layoutData" :bus="bus" />
        </div>
      </section>
    </div>
    <section class="toolbar">
      <el-button
        v-if="hasToday"
        class="today"
        size="small"
        plain
        @click="scrollToToday"
        >今天</el-button
      >
      <el-select
        v-model="colUnit"
        :clearable="false"
        size="small"
        class="col-unit"
      >
        <el-option v-for="u in colUnitOptions" :key="u.value" v-bind="u" />
      </el-select>
    </section>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import _uniq from 'lodash.uniq'
import GanttLayout from './gantt-layout.vue'
import {
  GanttData,
  GanttLayoutData,
  GanttNode,
  CollapsedMap,
  Bus,
  ColUnit,
  GanttMilestone,
  HoveringNode,
} from '@/utils/types'
import { isGroup, isMilestone, search } from '@/utils'
import dayjs from '@/utils/day'
import { DayData, getWeekdays, isRestDay } from '@/utils/weekday'

const colUnitOptions = [
  {
    label: '天',
    value: ColUnit.Day,
  },
  {
    label: '周',
    value: ColUnit.Week,
  },
  {
    label: '月',
    value: ColUnit.Month,
  },
]

function transform(
  ganttData: GanttData,
  dates: string[],
  collapsedMap: CollapsedMap,
  px = 0, // layout 容器在日期列中的起始位置
) {
  // HACK: 如果用 layoutData = ganttData.map 会导致 get y() 中找不到 layoutData
  const layoutData: GanttLayoutData = []
  ganttData.forEach((d, i) => {
    const xInDates = dates.indexOf(isMilestone(d) ? d.date : d.startDate)
    if (xInDates === -1) {
      console.error('时间不在日期列中', d) // 有可能是格式不对
    }
    const base = {
      id: d.id,
      name: d.name,
      x: xInDates - px,
      get y(): number {
        if (i === 0) return 0
        const { y, h } = layoutData[i - 1]
        return y + h
      },
    }
    if (isGroup(d)) {
      const g = {
        // ...base, // 很奇怪，这里一用展开运算符，h 的响应式就会失效，似乎代码在别的环境跑没问题
        id: d.id,
        name: d.name,
        x: xInDates - px,
        get y(): number {
          if (i === 0) return 0
          const { y, h } = layoutData[i - 1]
          return y + h
        },
        get h(): number {
          if (collapsedMap[this.id]) return 1
          return this.children.reduce((h: number, item) => {
            return h + item.h
          }, 1)
        },
        w: dayjs.$duration(d.startDate, d.endDate),
        progress: d.progress,
        children: transform(d.children, dates, collapsedMap, xInDates),
      }
      layoutData.push(g)
    } else if (isMilestone(d)) {
      layoutData.push({
        ...base,
        w: 1,
        h: 1,
        done: d.done,
      })
    } else {
      layoutData.push({
        ...base,
        w: dayjs.$duration(d.startDate, d.endDate),
        h: 1,
        progress: d.progress,
      })
    }
  })
  return layoutData
}

interface ContentStyle {
  width: string
  backgroundSize: string
}

interface MonthStyle {
  width: string
}

/**
 * 根据以下条件，返回列的时间范围
 * - 所有节点的最早开始时间 & 最晚结束时间
 * - 列模式
 */
function getRange(data: GanttData, colUnit: ColUnit = ColUnit.Day) {
  let startDate: string | undefined
  let endDate: string | undefined
  function loop(d: GanttData | GanttNode) {
    if (Array.isArray(d)) {
      d.forEach(loop)
    } else if (isMilestone(d)) {
      if (!startDate || dayjs(d.date).isBefore(startDate)) {
        startDate = d.date
      }
      if (!endDate || dayjs(d.date).isAfter(endDate)) {
        endDate = d.date
      }
    } else {
      if (!startDate || dayjs(d.startDate).isBefore(startDate)) {
        startDate = d.startDate
      }
      if (!endDate || dayjs(d.endDate).isAfter(endDate)) {
        endDate = d.endDate
      }
      if (isGroup(d)) loop(d.children)
    }
  }
  loop(data)

  switch (colUnit) {
    case ColUnit.Month:
      /**
       * 起始总是从月初开始
       * 方便 month 视图数据处理
       */
      startDate = dayjs(startDate)
        .startOf('month')
        .$format()
      /**
       * 末尾持续到几天后的月尾。同样是方便 month 视图处理
       * HACK: 这里和 gantt-milestone 组件还略有关系；因为该组件允许里程碑标题超出组件宽度限制，所以如果末尾留的位置不够，会导致 x-scroll-container 横向滚动出 bug
       */
      endDate = dayjs(endDate)
        .add(3, 'day')
        .endOf('month')
        .$format()
      break

    default:
      /**
       * 理由同上
       */
      startDate = dayjs(startDate)
        .$day(1)
        .$format()

      endDate = dayjs(endDate)
        .add(3, 'day')
        .$day(7)
        .$format()
      break
  }

  return [startDate!, endDate!]
}

/**
 * 将 startDate、endDate 范围的日子，补充到 range
 */
function complementRange(range: string[], startDate: string, endDate: string) {
  if (range.length) {
    const oldStart = range[0]
    for (
      let d = dayjs(oldStart).add(-1, 'day');
      d.isSameOrAfter(startDate);
      d = d.add(-1, 'day')
    ) {
      range.unshift(d.$format())
    }
    const oldEnd = range[range.length - 1]
    for (
      let d = dayjs(oldEnd).add(1, 'day');
      d.isSameOrBefore(endDate);
      d = d.add(1, 'day')
    ) {
      range.push(d.$format())
    }
  } else {
    for (
      let d = dayjs(startDate);
      d.isSameOrBefore(endDate);
      d = d.add(1, 'day')
    ) {
      range.push(d.$format())
    }
  }
}

const today = dayjs().$format()

export default Vue.extend({
  name: 'GanttChart',
  components: { GanttLayout },
  filters: {
    formatDate(date: string) {
      return dayjs(today).year() === dayjs(date).year()
        ? dayjs(date).format('MM-DD')
        : date
    },
  },
  props: {
    bus: {
      type: Object as PropType<Bus>,
      required: true,
    },
    data: {
      type: Array as PropType<GanttData>,
      required: true,
    },
    scrollTop: {
      type: Number,
      required: true,
    },
    dragData: {
      type: Object as PropType<{ node: GanttNode | null; movedCols: number }>,
      required: true,
    },
    resizeData: {
      type: Object as PropType<{ node: GanttNode | null; resizedCols: number }>,
      required: true,
    },
  },
  data: () => ({
    weekdays: {} as DayData,
    years: new Set<string | number>(),
    dates: [] as string[],
    colUnitOptions,
    today,
    hoveringNode: {
      visible: false,
      left: 0,
      width: 0,
      date: [],
    } as HoveringNode,
  }),
  computed: {
    hasToday(): boolean {
      return this.dates.includes(this.today)
    },
    colUnit: {
      get() {
        return this.bus.colUnit
      },
      set(v: ColUnit) {
        this.bus.colUnit = v
        const { ee } = this.bus
        ee.emit(ee.Event.ChangeColUnit, v)
      },
    },
    dayMode(): boolean {
      return this.colUnit === ColUnit.Day
    },
    weekMode(): boolean {
      return this.colUnit === ColUnit.Week
    },
    monthMode(): boolean {
      return this.colUnit === ColUnit.Month
    },
    weeks(): string[] {
      const { dates } = this
      const result = []
      for (let i = 0; i < dates.length; i += 7) {
        result.push(`${dates[i]} ~ ${dates[i + 6]}`)
      }
      return result
    },
    months(): string[] {
      const { dates } = this
      const months = dates.map((d) => dayjs(d).format('YYYY-MM'))
      const result = _uniq(months)

      return result
    },
    contentStyle(): ContentStyle {
      const { colW } = this.bus
      const result = {
        width: this.dates.length * colW + 'px',
        backgroundSize: colW + 'px',
      }
      if (this.colUnit === ColUnit.Week) {
        result.backgroundSize = colW * 7 + 'px'
      } else if (this.colUnit === ColUnit.Month) {
        // 因为每月的天数是不固定的，所以不使用 background-size 的方式
        result.backgroundSize = '0px'
      }
      return result
    },
    monthStyle(): (m: string) => MonthStyle {
      // 月的宽度根据当月的天数决定
      const { colW } = this.bus

      return (m: string) => {
        const numberOfDays = this.dates.filter((d) => d.startsWith(m)).length

        return {
          width: colW * numberOfDays + 'px',
        }
      }
    },
    hoveringNodeStyle() {
      return {
        left: this.hoveringNode.left + 'px',
        width: this.hoveringNode.width + 'px',
      }
    },
    layoutData(): GanttLayoutData {
      return transform(this.data, this.dates, this.bus.collapsedMap)
    },
    isToday(): (date: string) => boolean {
      return (date: string) => this.today === date
    },
    isCurrentMonth(): (month: string) => boolean {
      return (month: string) => dayjs(this.today).format('YYYY-MM') === month
    },
    dragPosition(): Set<string> {
      const set = new Set<string>()
      if (this.dragData.node) {
        const { node, movedCols } = this.dragData
        if (isMilestone(node)) {
          set.add(dayjs.$add(node.date, movedCols))
        } else {
          for (
            let d = dayjs(node.startDate);
            d.isSameOrBefore(node.endDate);
            d = d.add(1, 'day')
          ) {
            set.add(d.add(movedCols, 'day').$format())
          }
        }
      } else if (this.resizeData.node) {
        const { node, resizedCols } = this.resizeData
        if (isMilestone(node)) {
          set.add(dayjs.$add(node.date, resizedCols))
        } else {
          const endDate = dayjs.$add(node.endDate, resizedCols)
          for (
            let d = dayjs(node.startDate);
            d.isSameOrBefore(endDate);
            d = d.add(1, 'day')
          ) {
            set.add(d.$format())
          }
        }
      }
      return set
    },
    /**
     * 记录当天的里程碑（只取其中一个）
     */
    milestoneMap(): Record<string, GanttMilestone> {
      const result = {} as Record<string, GanttMilestone>
      function loop(data: GanttData) {
        data.forEach((d) => {
          if (isMilestone(d)) {
            result[d.date] = d
          } else if (isGroup(d)) {
            loop(d.children)
          }
        })
      }
      loop(this.data)
      return result
    },
  },
  watch: {
    scrollTop(v) {
      ;(this.$refs.yScrollContainer as HTMLElement).scrollTo(0, v)
    },
    data: {
      immediate: true,
      handler() {
        this.complementDates()
      },
    },
    dates: {
      handler(range: string[]) {
        // FIXME: 持续时间不会跨三年吧
        const startYear = dayjs(range[0]).year() // undefined 则是今年
        this.getWeekdays(startYear)
        const endYear = dayjs(range[range.length - 1]).year()
        this.getWeekdays(endYear)
      },
      immediate: true,
    },
    colUnit() {
      // 不同的视图需要展示的日期范围可能是不同的，所以切换视图时重置
      this.dates = []
      this.complementDates()
    },
  },
  created() {
    const { ee } = this.bus
    ee.on(ee.Event.ScrollTo, ({ x, y }: { x: number; y: number }) => {
      let lastX: number | undefined
      let lastY: number | undefined
      const xScrollContainer = this.$refs.xScrollContainer as HTMLElement
      const scroll = () => {
        const curX = xScrollContainer.scrollLeft
        const curY = this.scrollTop
        if (lastX === curX && lastY === curY) {
          // 上次滚动失效，说明滚动目标已经溢出可滚动范围了
          return
        }
        lastX = curX
        lastY = curY
        const diffX = x - curX
        const diffY = y - curY
        let targetX: number, targetY: number
        const speed = 0.2
        const threshold = 5
        if (Math.abs(diffX) < threshold && Math.abs(diffY) < threshold) {
          targetX = x
          targetY = y
        } else {
          targetX = Math.round(curX + diffX * speed)
          targetY = Math.round(curY + diffY * speed)
          requestAnimationFrame(scroll)
        }
        this.$emit('update:scrollTop', targetY)
        xScrollContainer.scrollLeft = targetX
      }
      scroll()
    })
    ee.on(ee.Event.StartHover, ({ id, x, w }: any) => {
      const [node] = search(id, this.data) as [GanttNode]

      let minWidth = 120 // 给定一个最小宽度，否则日期比较长时无法正常展示
      let date = []

      if (isMilestone(node)) {
        minWidth = 80
        date = [node.date]
      } else {
        date = [node.startDate, node.endDate]
      }

      const width = w < minWidth ? minWidth : w

      // 使居中
      const left = x - (width - w) / 2

      this.hoveringNode = {
        visible: true,
        left,
        width,
        date,
      }
    })

    ee.on(ee.Event.EndHover, () => {
      this.hoveringNode.visible = false
    })
  },
  methods: {
    complementDates() {
      const { data } = this
      if (!data.length) return
      // FIXME: 应当限制日期最长范围，防止程序崩溃。需要进行性能测试
      const [startDate, endDate] = getRange(data, this.colUnit)
      complementRange(this.dates, startDate, endDate)
    },
    isRestDay(date: string) {
      return date in this.weekdays && isRestDay(this.weekdays[date].type)
    },
    getDesc(date: string) {
      return date in this.weekdays ? this.weekdays[date].desc : ''
    },
    getDayContent(date: string) {
      switch (this.colUnit) {
        case ColUnit.Week: {
          const map = ['日', '一', '二', '三', '四', '五', '六']
          return map[dayjs(date).day()]
        }
        case ColUnit.Day:
        default:
          return date.slice(5)
      }
    },
    onScroll(e: { target: HTMLElement }) {
      this.$emit('update:scrollTop', e.target.scrollTop)
    },
    async getWeekdays(year: number | string) {
      if (this.years.has(year)) return
      try {
        this.weekdays = {
          ...this.weekdays,
          ...(await getWeekdays(year)),
        }
        this.years.add(year)
      } catch (error) {
        console.error(error)
      }
    },
    scrollToMilestone(id: string) {
      const { ee } = this.bus
      ee.emit(ee.Event.ScrollToNode, id)
    },
    scrollToToday() {
      const el = document.querySelector('.v-gantt .date.today')
      if (!el) return
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    },
  },
})
</script>
<style lang="less" scoped>
@import '../assets/vars';
@borderColor: rgba(0, 0, 0, 0.1);

.gantt-chart {
  position: relative;
  width: 1px; // HACK: 否则内容会把自身撑出容器

  .x-scroll-container {
    height: 100%;
    overflow-x: scroll; // 与 tree 下边对齐
    overflow-y: hidden; // 隐藏突出的列阴影
    border: 1px solid @borderColor; // FIXME: 滚动到最右侧，右侧 border 是两倍粗
    position: relative;
  }

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(to left, @borderColor 1px, transparent 1px);
    padding-bottom: 20px;

    header {
      position: relative;
      height: @header-height;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      border-bottom: 1px solid @borderColor;
      user-select: none; // HACK: resize 时会莫名选中标题

      .months {
        flex: 1 0 50%;
        width: 100%;
        display: flex;
        font-size: 14px;
        border-bottom: 1px solid @borderColor;

        .month {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          // month 视图使用伪类实现分割线
          &::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 1px;
            height: 100vh;
            background: linear-gradient(
              to left,
              rgba(0, 0, 0, 0.1) 1px,
              transparent 1px
            );
          }
        }
      }

      .weeks {
        flex: 1 0 50%;
        width: 100%;
        display: flex;
        font-size: 14px;
        border-bottom: 1px solid @borderColor;

        .week {
          flex: 1 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
      }

      .dates {
        flex: 1 0 50%;
        width: 100%;
        display: flex;
        font-size: 14px;
        border-bottom: 1px solid @borderColor;

        .date {
          flex: 1 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          .desc {
            position: absolute;
            bottom: 0;
            left: 0;
            transform: scale(0.8);
            width: 100%;
            transform-origin: 50%;
            opacity: 0.8;
            text-align: center;
            font-size: 12px;
          }

          // mixin
          .row-background(@color) {
            &::before {
              content: '';
              position: absolute;
              top: calc(100% + 2px);
              left: 0;
              right: 1px;
              height: 10000px;
              background-color: @color;
            }
          }

          &.rest {
            .row-background(rgba(247, 247, 247));
          }

          &.today {
            color: @progress-content;
            .row-background(rgba(242, 248, 255)); // omniplan
          }

          &.milestone {
            color: @progress-content;

            .milestone-line {
              position: absolute;
              top: calc(100% + 1px);
              left: calc(100% - 1px);
              width: 2px;
              height: 10000px;
              background-color: fade(@progress-background, 50%);

              &:hover {
                transform: scaleX(3);
              }
            }

            &.done {
              color: @done;

              .milestone-line {
                background-color: fade(@done, 50%);
              }
            }
          }

          &.on-drop {
            color: white !important;
            background-color: fade(@progress-content, 70%);
            .row-background(fade(@progress-background, 20%));
          }

          .date-in-month {
            @offset: 4px;

            position: absolute;
            top: @offset / 2;
            right: @offset;
            transform: scale(0.55);
            transform-origin: 100% 0;
            line-height: 1;
          }
        }
      }

      .hovering-node-date {
        box-sizing: border-box;
        position: absolute;
        min-width: 120px;
        background: @progress-content;
        border-radius: 3px;
        color: white;
        display: flex;
        justify-content: space-between;
        padding: 2px 5px;
        bottom: 0;
        font-size: 13px;

        &.is-milestone {
          min-width: 80px;
          justify-content: center;
        }
      }
    }

    .y-scroll-container {
      flex: 1 0 0;
      overflow-y: auto;

      &::-webkit-scrollbar {
        display: none;
      }

      & > .gantt-layout {
        height: 100%; // 用处基本上只为了在 vue 开发者工具中正确高亮其范围
      }
    }
  }

  .toolbar {
    position: absolute;
    top: @header-height + 10px;
    right: 10px;
    display: flex;

    @fontColor: #444;

    .today,
    .col-unit {
      width: 56px; // el-button size=small
      box-shadow: 0 3px 12px 0 rgba(48, 48, 48, 0.05),
        0 3px 6px 0 rgba(48, 48, 48, 0.1); // 来自 ones-plan 的样式

      color: @fontColor;
    }

    .today {
      margin-right: 10px;

      &:hover,
      &:focus {
        border-color: #ccc;
      }
    }

    .col-unit {
      /deep/ input {
        padding: 0 10px;
        color: @fontColor;
        border-radius: 3px; // el-button size=small
      }

      /deep/ i {
        color: @fontColor;
      }
    }
  }
}
</style>
