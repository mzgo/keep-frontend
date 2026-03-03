<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { getCaptcha, login } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref({
  username: '',
  password: '',
  captchaText: '',
})

const captchaId = ref('')
const captchaSvg = ref('')
const loading = ref(false)

async function loadCaptcha() {
  try {
    const { data } = await getCaptcha()
    captchaId.value = data.data.captcha_id
    captchaSvg.value = data.data.svg
  } catch {
    showToast('获取验证码失败')
  }
}

async function onSubmit() {
  loading.value = true
  try {
    const { data } = await login({
      username: form.value.username,
      password: form.value.password,
      captcha_id: captchaId.value,
      captcha_text: form.value.captchaText,
    })

    auth.setTokens(data.data.access_token, data.data.refresh_token)
    auth.setUser(data.data.user)

    showToast('登录成功')

    const redirect = route.query.redirect as string
    if (redirect) {
      router.replace(redirect)
    } else {
      router.replace(data.data.user.role === 'manager' ? '/manager' : '/checker')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || '登录失败'
    showToast(msg)
    await loadCaptcha()
    form.value.captchaText = ''
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptcha)
</script>

<template>
  <div class="login-page">
    <div class="login-header">
      <img src="/logo.png" alt="脂付宝" class="login-logo" />
      <h1 class="login-title">脂付宝</h1>
      <p class="login-subtitle">坚持运动，积分兑换</p>
    </div>

    <div class="login-card">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
            autocomplete="username"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            autocomplete="current-password"
          />
          <van-field
            v-model="form.captchaText"
            name="captcha"
            label="验证码"
            placeholder="请输入验证码"
            :rules="[{ required: true, message: '请输入验证码' }]"
          >
            <template #button>
              <div class="captcha-image" @click="loadCaptcha" v-html="captchaSvg" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="login-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
          <div class="login-links">
            <router-link to="/register" class="link">管理者注册</router-link>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 16px 24px;
  background: linear-gradient(180deg, var(--keep-green-dark) 0%, var(--keep-green) 20%, #f5f5f5 45%);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.login-title {
  color: #fff;
  font-size: 22px;
  margin-top: 12px;
  letter-spacing: 2px;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  margin-top: 4px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 0;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.captcha-image {
  cursor: pointer;
  height: 32px;
  display: flex;
  align-items: center;
}

.captcha-image :deep(svg) {
  height: 32px;
  width: auto;
  border-radius: 4px;
}

.login-actions {
  padding: 24px 16px 0;
}

.login-links {
  text-align: center;
  margin-top: 16px;
}

.link {
  color: var(--keep-green);
  font-size: 14px;
  text-decoration: none;
}
</style>
