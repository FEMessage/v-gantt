import axios from 'axios'
import { cachedAsync } from '@/utils'

const rollToolsApiHost = 'https://www.mxnzp.com/api'

enum DayType {
  Weekday = 0,
  Weekend = 1,
  Holiday = 2,
}

export function isWeekDay(type: DayType) {
  return type === DayType.Weekday
}

export function isRestDay(type: DayType) {
  return !isWeekDay(type)
}

export interface DayData {
  [date: string]: {
    date: string
    type: DayType
    weekDay: number // 周一：1；周日：7
    desc: string
  }
}

interface RawData {
  code: 0 | 1 // 1 代表有数据
  msg: string
  data: {
    days: {
      date: string
      weekDay: number
      type: DayType
      typeDes: string
    }[]
  }[]
}

function getDesc(d: RawData['data'][0]['days'][0]) {
  const map = ['日', '一', '二', '三', '四', '五', '六', '日']
  return d.type === DayType.Holiday ? d.typeDes : `周${map[d.weekDay]}`
}

const ROLL_TOOLS_APP_ID = 'kurvgnsppveqjpno'
const ROLL_TOOLS_APP_SECRET = 'aWxTN1N4NGhXTW9rRVJLb082NDdpZz09'

async function _getWeekdays(year: number | string) {
  const data: DayData = {}
  try {
    const rawData: RawData = (
      await axios.get(`${rollToolsApiHost}/holiday/list/year/${year}`, {
        params: {
          /* eslint-disable @typescript-eslint/camelcase */
          app_id: ROLL_TOOLS_APP_ID,
          app_secret: ROLL_TOOLS_APP_SECRET,
          /* eslint-enable @typescript-eslint/camelcase */
        },
      })
    ).data
    if (rawData.code === 0) {
      console.error(`请求的工作日数据不存在：${year} 年`)
    } else {
      rawData.data.forEach(({ days }) => {
        days.forEach((d) => {
          data[d.date] = {
            date: d.date,
            weekDay: d.weekDay,
            type: d.type,
            desc: getDesc(d),
          }
        })
      })
    }
  } catch (error) {
    console.error(error)
  }
  return data
}

export const getWeekdays = cachedAsync(_getWeekdays)
