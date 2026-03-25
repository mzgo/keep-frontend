import request from '@/utils/request'

export function getAvailablePrizes() {
  return request.get('/prizes')
}

export function getManagerPrizes() {
  return request.get('/manager/prizes')
}

export function createPrize(data) {
  return request.post('/manager/prizes', data)
}

export function updatePrize(id, data) {
  return request.put(`/manager/prizes/${id}`, data)
}

export function archivePrize(id) {
  return request.delete(`/manager/prizes/${id}`)
}
