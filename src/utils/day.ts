import dayjs from 'dayjs'
import en from 'dayjs/locale/en'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.locale({
  ...en,
  weekStart: 1,
})

export const format = 'YYYY-MM-DD'

/**
 * 增一天，直接返回 string
 */
function add(d?: dayjs.ConfigType, v = 1, u: dayjs.UnitType = 'day') {
  return dayjs(d)
    .add(v, u)
    .$format()
}
/**
 * 返回持续时间
 */
function duration(start: dayjs.ConfigType, end: dayjs.ConfigType) {
  return dayjs(end).$diffDay(start) + 1
}
// 参考 dayjs 官方 plugin 声明方式
declare module 'dayjs' {
  let $add: typeof add
  let $duration: typeof duration
  interface Dayjs {
    $day(d: number): Dayjs
    $day(): number
    $month(d: number): Dayjs
    $month(): number
    $format(): string
    $diffDay(d: dayjs.ConfigType): number
  }
}
dayjs.$add = add
dayjs.$duration = duration
dayjs.extend((_, Dayjs) => {
  /**
   * 星期日为 7
   */
  // @ts-ignore
  Dayjs.prototype.$day = function(d?: number) {
    if (d === undefined) {
      return this.day() || 7
    }
    // 如果当前天是周日，传 d = 1 时会跳到下周一；我们期望 d 传 1~7 时仍在本周
    if (this.$day() === 7) {
      return this.day(d - 7)
    } else {
      return this.day(d)
    }
  }
  /**
   * 一月是 1
   */
  // @ts-ignore
  Dayjs.prototype.$month = function(m) {
    if (m === undefined) {
      return this.month() + 1
    } else {
      return this.month(m - 1)
    }
  }
  /**
   * 标准 format
   */
  Dayjs.prototype.$format = function() {
    return this.format(format)
  }
  /**
   * 原本 diff 很不靠谱，它会认为 dayjs('2020-03-24T08:00:00+08:00').diff('2020-03-23', 'day) === 0
   * 这里先转成 format 再比较
   */
  Dayjs.prototype.$diffDay = function(d: dayjs.ConfigType) {
    const self = this.$format()
    const that = dayjs(d).$format()
    return dayjs(self).diff(that, 'day')
  }
})

export default dayjs
