import axios from 'axios'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '请求失败，请稍后重试'

    if (status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push({ name: 'Login' })
      showToast('登录已过期，请重新登录')
    } else if (status === 403) {
      showToast('无权限访问')
    } else if (status >= 500) {
      showToast('服务器异常，请稍后重试')
    } else {
      showToast(message)
    }

    return Promise.reject(error)
  }
)

export default request
