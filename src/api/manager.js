import request from '@/utils/request'

export function getConfig() {
  return request.get('/manager/config')
}

export function saveConfig(data) {
  return request.put('/manager/config', data)
}

export function generateInvite() {
  return request.post('/manager/invite')
}

export function getCheckers() {
  return request.get('/manager/checkers')
}

export function getManagerOrders(status) {
  return request.get('/manager/orders', { params: { status } })
}

export function verifyOrder(orderId, verifyToken) {
  return request.post(`/manager/orders/${orderId}/verify`, { verifyToken })
}
