/**
 * 打卡日边界计算工具
 * 一个"打卡日"= RESET_HOUR:00:00 至次日 (RESET_HOUR-1):59:59 (UTC+8)
 */

const DEFAULT_RESET_HOUR = 5
const TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000 // UTC+8

/**
 * 获取指定时刻对应的"打卡日"日期字符串 (YYYY-MM-DD)
 * 例: resetHour=5 时，2026-03-25 04:59 属于 2026-03-24 的打卡日
 *                     2026-03-25 05:00 属于 2026-03-25 的打卡日
 */
export function getCheckinDate(timestamp = Date.now(), resetHour = DEFAULT_RESET_HOUR) {
  // 转为 UTC+8 时间戳
  const utc8Ms = timestamp + TIMEZONE_OFFSET_MS
  const utc8Date = new Date(utc8Ms)

  const hours = utc8Date.getUTCHours()

  // 如果当前小时 < resetHour，则属于前一天的打卡日
  if (hours < resetHour) {
    utc8Date.setUTCDate(utc8Date.getUTCDate() - 1)
  }

  const y = utc8Date.getUTCFullYear()
  const m = String(utc8Date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(utc8Date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 判断当前是否已过今天的重置时间
 */
export function isPastResetTime(timestamp = Date.now(), resetHour = DEFAULT_RESET_HOUR) {
  const utc8Ms = timestamp + TIMEZONE_OFFSET_MS
  const utc8Date = new Date(utc8Ms)
  return utc8Date.getUTCHours() >= resetHour
}

/**
 * 获取今天的打卡日重置时间点 (UTC 时间戳)
 */
export function getTodayResetTimestamp(resetHour = DEFAULT_RESET_HOUR) {
  const now = new Date()
  const utc8Ms = now.getTime() + TIMEZONE_OFFSET_MS
  const utc8Date = new Date(utc8Ms)

  utc8Date.setUTCHours(resetHour, 0, 0, 0)
  return utc8Date.getTime() - TIMEZONE_OFFSET_MS
}

/**
 * 计算两个日期字符串之间相差的天数
 */
export function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA).getTime()
  const b = new Date(dateStrB).getTime()
  return Math.round(Math.abs(b - a) / (24 * 60 * 60 * 1000))
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
