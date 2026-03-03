import apiClient from './client'

export interface Order {
  id: string
  prize_id: string
  prize_name: string
  prize_image_key: string | null
  prize_image_url: string | null
  points_spent: number
  status: 'pending' | 'verified' | 'cancelled'
  verify_code: string
  created_at: number
  verified_at: number | null
  cancelled_at: number | null
}

export interface CancelCheckResult {
  order_id: string
  points_spent: number
  expired_points: number
  refundable_points: number
  has_expired: boolean
}

export interface ManagerOrder extends Order {
  user_nickname: string
}

export function getMyOrders(status?: string, page: number = 1) {
  return apiClient.get<{ success: boolean; data: Order[] }>('/orders/mine', {
    params: { status, page },
  })
}

export function cancelCheck(orderId: string) {
  return apiClient.get<{ success: boolean; data: CancelCheckResult }>(`/orders/cancel-check/${orderId}`)
}

export function cancelOrder(orderId: string) {
  return apiClient.post<{ success: boolean; data: { restored_points: number; expired_points: number } }>(
    `/orders/cancel/${orderId}`
  )
}

export function verifyOrder(verifyCode: string) {
  return apiClient.post<{ success: boolean; data: { order_id: string; prize_name: string; user_nickname: string } }>(
    '/orders/verify',
    { verify_code: verifyCode }
  )
}

export function getManagerOrders(status?: string, page: number = 1) {
  return apiClient.get<{ success: boolean; data: ManagerOrder[] }>('/orders/manage', {
    params: { status, page },
  })
}
