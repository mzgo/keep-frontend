import apiClient from './client'

export interface CheckinStatus {
  checked_today: boolean
  today_date: string
  consecutive_days: number
  cycle_progress: number
  days_until_reward: number
  checkin_days: number
  points_per_cycle: number
  completed_cycles: number
  bonus_progress: number
  bonus_cycles: number
  bonus_points: number
}

export interface CheckinRecord {
  id: string
  image_url: string
  image_key: string
  note: string | null
  checkin_date: string
  created_at: number
}

export interface CalendarDay {
  date: string
  image_url: string
}

export function doCheckin(image: File, note?: string) {
  const formData = new FormData()
  formData.append('image', image)
  if (note) formData.append('note', note)
  return apiClient.post<{ success: boolean; data: { id: string; checkin_date: string; image_url: string } }>(
    '/checkin',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

export function getCheckinStatus() {
  return apiClient.get<{ success: boolean; data: CheckinStatus }>('/checkin/status')
}

export function getCheckinHistory(page: number = 1, limit: number = 30) {
  return apiClient.get<{ success: boolean; data: CheckinRecord[] }>('/checkin/history', {
    params: { page, limit },
  })
}

export function getCheckinCalendar(year: string, month: string) {
  return apiClient.get<{ success: boolean; data: CalendarDay[] }>('/checkin/calendar', {
    params: { year, month },
  })
}
