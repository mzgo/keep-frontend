import request from '@/utils/request'

export function submitCheckin(data) {
  return request.post('/checkin', data)
}

export function getTodayStatus() {
  return request.get('/checkin/dashboard')
}

export function getCheckinHistory() {
  return request.get('/checkin/history')
}

export function getMonthRecords(year, month) {
  return request.get('/checkin/month', { params: { year, month } })
}
