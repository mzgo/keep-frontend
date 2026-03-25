import { describe, it, expect } from 'vitest'
import { getCheckinDate, daysBetween } from '@/utils/date'

describe('getCheckinDate', () => {
  // 辅助: 构造 UTC+8 指定时间的 UTC 时间戳
  function utc8(year, month, day, hour, min = 0) {
    return Date.UTC(year, month - 1, day, hour - 8, min)
  }

  it('5:00 AM 及之后属于当天的打卡日', () => {
    // 2026-03-25 05:00 (UTC+8) -> 打卡日 2026-03-25
    const ts = utc8(2026, 3, 25, 5, 0)
    expect(getCheckinDate(ts, 5)).toBe('2026-03-25')
  })

  it('4:59 AM 属于前一天的打卡日', () => {
    // 2026-03-25 04:59 (UTC+8) -> 打卡日 2026-03-24
    const ts = utc8(2026, 3, 25, 4, 59)
    expect(getCheckinDate(ts, 5)).toBe('2026-03-24')
  })

  it('23:59 PM 属于当天的打卡日', () => {
    const ts = utc8(2026, 3, 25, 23, 59)
    expect(getCheckinDate(ts, 5)).toBe('2026-03-25')
  })

  it('自定义 resetHour=8 时，7:59 属于前一天', () => {
    const ts = utc8(2026, 3, 25, 7, 59)
    expect(getCheckinDate(ts, 8)).toBe('2026-03-24')
  })

  it('自定义 resetHour=8 时，8:00 属于当天', () => {
    const ts = utc8(2026, 3, 25, 8, 0)
    expect(getCheckinDate(ts, 8)).toBe('2026-03-25')
  })

  it('跨月边界: 月末 4:59 属于前一天', () => {
    // 2026-04-01 04:59 (UTC+8) -> 打卡日 2026-03-31
    const ts = utc8(2026, 4, 1, 4, 59)
    expect(getCheckinDate(ts, 5)).toBe('2026-03-31')
  })

  it('跨年边界: 1月1日 04:59 属于12月31日', () => {
    const ts = utc8(2027, 1, 1, 4, 59)
    expect(getCheckinDate(ts, 5)).toBe('2026-12-31')
  })
})

describe('daysBetween', () => {
  it('计算相邻两天的差值', () => {
    expect(daysBetween('2026-03-25', '2026-03-26')).toBe(1)
  })

  it('同一天差值为0', () => {
    expect(daysBetween('2026-03-25', '2026-03-25')).toBe(0)
  })

  it('跨月计算', () => {
    expect(daysBetween('2026-03-30', '2026-04-02')).toBe(3)
  })
})
