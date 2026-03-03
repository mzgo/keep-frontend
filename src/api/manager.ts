import apiClient from './client'

export interface ManagerConfig {
  id: string
  manager_id: string
  checkin_days: number
  points_per_cycle: number
  bonus_cycles: number
  bonus_points: number
  points_expiry_days: number
  penalty_inactive_days: number
  penalty_points: number
  day_reset_hour: number
  is_configured: number
}

export interface Invitation {
  id: string
  manager_id: string
  code: string
  is_used: number
  used_by: string | null
  created_at: number
}

export interface CheckerInfo {
  id: string
  username: string
  nickname: string
  avatar_url: string | null
  created_at: number
}

export function getConfig() {
  return apiClient.get<{ success: boolean; data: ManagerConfig }>('/manager/config')
}

export function updateConfig(params: Partial<ManagerConfig>) {
  return apiClient.put('/manager/config', params)
}

export function getConfigStatus() {
  return apiClient.get<{ success: boolean; data: { is_configured: boolean } }>('/manager/config/status')
}

export function createInvitation() {
  return apiClient.post<{ success: boolean; data: { code: string; id: string } }>('/manager/invitations')
}

export function getInvitations() {
  return apiClient.get<{ success: boolean; data: Invitation[] }>('/manager/invitations')
}

export function getCheckers() {
  return apiClient.get<{ success: boolean; data: CheckerInfo[] }>('/manager/checkers')
}
