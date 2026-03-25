<template>
  <div class="page-container login-page">
    <div class="login-brand">
      <img src="/icons/logo.svg" alt="Keep" class="login-logo" />
      <h1 class="login-title">Keep 运动打卡</h1>
      <p class="login-subtitle">坚持运动，收获奖励</p>
    </div>

    <div class="login-form card">
      <van-form @submit="handleLogin">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
          <van-field
            v-model="form.captchaCode"
            label="验证码"
            placeholder="请输入验证码"
            :rules="[{ required: true, message: '请输入验证码' }]"
          >
            <template #button>
              <img
                v-if="captchaUrl"
                :src="captchaUrl"
                class="captcha-img"
                alt="验证码"
                @click="refreshCaptcha"
              />
            </template>
          </van-field>
        </van-cell-group>

        <div class="login-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
          <div class="login-links">
            <router-link :to="registerRoute">注册账号</router-link>
            <router-link to="/password-reset">忘记密码?</router-link>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login, getCaptcha, getCurrentUser } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = ref({ username: '', password: '', captchaCode: '', captchaId: '' })
const captchaUrl = ref('')
const loading = ref(false)

// 如果从邀请链接来，注册时携带 invite token
const registerRoute = computed(() => {
  const inviteToken = route.query.invite
  return inviteToken ? `/register?invite=${inviteToken}` : '/register'
})

async function refreshCaptcha() {
  try {
    const res = await getCaptcha()
    form.value.captchaId = res.data.captchaId
    captchaUrl.value = res.data.captchaImage
  } catch { /* 静默 */ }
}

async function handleLogin() {
  loading.value = true
  try {
    const res = await login({
      username: form.value.username,
      password: form.value.password,
      captchaId: form.value.captchaId,
      captchaCode: form.value.captchaCode
    })
    const userRes = await getCurrentUser()
    auth.setAuth(res.data.token, userRes.data)

    const redirect = route.query.redirect
    router.replace(redirect || auth.homeRoute)
  } catch {
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(refreshCaptcha)
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-md);
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 40%, var(--color-bg-page) 40%);
}
.login-brand {
  text-align: center;
  padding: var(--spacing-xl) 0;
}
.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
}
.login-title {
  color: #fff;
  font-size: 24px;
  margin-top: var(--spacing-md);
}
.login-subtitle {
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  margin-top: var(--spacing-xs);
}
.login-form {
  width: 100%;
  max-width: 400px;
  margin-top: var(--spacing-lg);
}
.login-actions {
  padding: var(--spacing-lg) var(--spacing-md);
}
.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  font-size: 14px;
}
.login-links a {
  color: var(--color-primary);
  text-decoration: none;
}
.captcha-img {
  height: 32px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}
</style>
