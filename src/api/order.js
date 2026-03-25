import request from '@/utils/request'

export function redeemPrize(prizeId) {
  return request.post('/orders/redeem', { prizeId })
}

export function cancelOrder(orderId) {
  return request.post(`/orders/${orderId}/cancel`)
}

export function getMyOrders(status) {
  return request.get('/orders', { params: { status } })
}
