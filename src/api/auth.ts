import apiClient from './client'

export interface LoginParams {
  username: string
  password: string
  captcha_id: string
  captcha_text: string
}

export interface RegisterParams {
  username: string
  password: string
  captcha_id: string
  captcha_text: string
  email?: string
  role: 'manager' | 'checker'
  invite_code?: string
}

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar_url: string | null
  role: 'manager' | 'checker'
  email: string | null
  manager_id: string | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: UserInfo
}

export function getCaptcha() {
  return apiClient.get<{ success: boolean; data: { captcha_id: string; svg: string } }>('/auth/captcha')
}

export function login(params: LoginParams) {
  return apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', params)
}

export function register(params: RegisterParams) {
  return apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', params)
}

export function logout(refreshToken: string) {
  return apiClient.post('/auth/logout', { refresh_token: refreshToken })
}

export function getMe() {
  return apiClient.get<{ success: boolean; data: UserInfo }>('/auth/me')
}

export function updateProfile(params: { nickname?: string; email?: string }) {
  return apiClient.put('/auth/profile', params)
}

export function updatePassword(params: { old_password: string; new_password: string }) {
  return apiClient.put('/auth/password', params)
}

export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<{ success: boolean; data: { avatar_url: string } }>('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
