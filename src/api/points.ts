import apiClient from './client'

export interface PointsSummary {
  available: number
  expiring_in_30_days: number
}

export interface PointsEvent {
  id: string
  event_type: 'earn_checkin' | 'earn_bonus' | 'redeem' | 'cancel_redeem' | 'expire' | 'penalty'
  amount: number
  description: string | null
  created_at: number
}

export function getPointsSummary() {
  return apiClient.get<{ success: boolean; data: PointsSummary }>('/points/summary')
}

export function getPointsEvents(page: number = 1, limit: number = 20) {
  return apiClient.get<{ success: boolean; data: PointsEvent[] }>('/points/events', {
    params: { page, limit },
  })
}
