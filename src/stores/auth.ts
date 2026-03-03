import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string>('')
  const refreshToken = ref<string>('')
  const userId = ref<string>('')
  const username = ref<string>('')
  const nickname = ref<string>('')
  const avatarUrl = ref<string>('')
  const userRole = ref<'manager' | 'checker' | ''>('')
  const email = ref<string>('')
  const managerId = ref<string>('')

  const isLoggedIn = computed(() => !!accessToken.value && !!userId.value)

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
  }

  function setUser(user: {
    id: string
    username: string
    nickname: string
    avatar_url: string | null
    role: 'manager' | 'checker'
    email: string | null
    manager_id: string | null
  }) {
    userId.value = user.id
    username.value = user.username
    nickname.value = user.nickname
    avatarUrl.value = user.avatar_url || ''
    userRole.value = user.role
    email.value = user.email || ''
    managerId.value = user.manager_id || ''
  }

  function clearAuth() {
    accessToken.value = ''
    refreshToken.value = ''
    userId.value = ''
    username.value = ''
    nickname.value = ''
    avatarUrl.value = ''
    userRole.value = ''
    email.value = ''
    managerId.value = ''
  }

  return {
    accessToken,
    refreshToken,
    userId,
    username,
    nickname,
    avatarUrl,
    userRole,
    email,
    managerId,
    isLoggedIn,
    setTokens,
    setUser,
    clearAuth,
  }
}, {
  persist: {
    pick: [
      'accessToken', 'refreshToken', 'userId', 'username',
      'nickname', 'avatarUrl', 'userRole', 'email', 'managerId',
    ],
  },
})
