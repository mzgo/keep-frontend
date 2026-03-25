import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const initialized = ref(false)
  let bootstrapPromise = null

  const isLoggedIn = computed(() => !!token.value)

  const homeRoute = computed(() => {
    if (!user.value) return { name: 'Login' }
    return user.value.role === 'MANAGER'
      ? { name: 'ManagerDashboard' }
      : { name: 'CheckerHome' }
  })

  function setAuth(tokenValue, userInfo) {
    token.value = tokenValue
    user.value = userInfo
    initialized.value = true
    localStorage.setItem('token', tokenValue)
  }

  function logout() {
    token.value = ''
    user.value = null
    initialized.value = true
    localStorage.removeItem('token')
  }

  function updateUser(partial) {
    if (user.value) {
      Object.assign(user.value, partial)
    }
  }

  async function bootstrap() {
    if (initialized.value) return
    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = (async () => {
      try {
        if (token.value) {
          const { getCurrentUser } = await import('@/api/auth')
          const res = await getCurrentUser()
          user.value = res.data
        }
      } catch {
        token.value = ''
        user.value = null
        localStorage.removeItem('token')
      } finally {
        initialized.value = true
        bootstrapPromise = null
      }
    })()

    return bootstrapPromise
  }

  return {
    token,
    user,
    isLoggedIn,
    initialized,
    homeRoute,
    setAuth,
    logout,
    updateUser,
    bootstrap
  }
})
