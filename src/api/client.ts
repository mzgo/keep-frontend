import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

// 请求拦截器：自动携带 Access Token
apiClient.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

// 响应拦截器：401 时自动用 Refresh Token 续期
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const auth = useAuthStore()

    // 没有 refresh token，直接登出
    if (!auth.refreshToken) {
      auth.clearAuth()
      router.push('/login')
      return Promise.reject(error)
    }

    // 如果正在刷新，排队等待
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${token}`
          originalRequest._retry = true
          resolve(apiClient(originalRequest))
        })
      })
    }

    isRefreshing = true
    originalRequest._retry = true

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
        refresh_token: auth.refreshToken,
      })

      if (data.success) {
        auth.setTokens(data.data.access_token, data.data.refresh_token)
        onTokenRefreshed(data.data.access_token)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`
        return apiClient(originalRequest)
      }

      throw new Error('Token refresh failed')
    } catch {
      auth.clearAuth()
      router.push('/login')
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
