import apiClient from './client'

export interface Prize {
  id: string
  name: string
  image_url: string | null
  image_key: string | null
  points_required: number
  stock: number
  is_blind_box: number
  is_active: number
  created_at: number
}

export interface ShopPrize extends Prize {
  can_redeem: boolean
  points_short: number
}

export function getManagerPrizes() {
  return apiClient.get<{ success: boolean; data: Prize[] }>('/prizes/manage')
}

export function createPrize(formData: FormData) {
  return apiClient.post('/prizes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updatePrize(id: string, formData: FormData) {
  return apiClient.put(`/prizes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getShopPrizes() {
  return apiClient.get<{ success: boolean; data: ShopPrize[]; available_points: number }>('/prizes/shop')
}

export function redeemPrize(prizeId: string) {
  return apiClient.post<{ success: boolean; data: { order_id: string; verify_code: string } }>(
    `/prizes/redeem/${prizeId}`
  )
}
