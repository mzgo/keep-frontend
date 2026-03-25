import request from '@/utils/request'

export function getPointsBalance() {
  return request.get('/points/balance')
}

export function getPointsTransactions() {
  return request.get('/points/transactions')
}

export function getExpiringPoints() {
  return request.get('/points/expiring')
}
