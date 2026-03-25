import request from '@/utils/request'

export function getCaptcha() {
  return request.get('/auth/captcha')
}

export function register(data) {
  return request.post('/auth/register', data)
}

export function login(data) {
  return request.post('/auth/login', data)
}

export function getCurrentUser() {
  return request.get('/auth/me')
}

export function updateProfile(data) {
  return request.put('/auth/profile', data)
}

export function changePassword(data) {
  return request.put('/auth/password', data)
}

export function requestPasswordReset(data) {
  return request.post('/auth/password-reset/request', data)
}

export function resetPassword(data) {
  return request.post('/auth/password-reset/confirm', data)
}

export function bindEmail(data) {
  return request.post('/auth/email/bind', data)
}

export function sendEmailCode(data) {
  return request.post('/auth/email/code', data)
}
