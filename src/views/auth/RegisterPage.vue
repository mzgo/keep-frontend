<template>
  <div class="page-container">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />
    <div class="register-content">
      <van-form @submit="handleRegister">
        <van-cell-group inset>
          <van-field v-model="form.username" label="用户名" placeholder="请输入用户名" :rules="[{ required: true }]" />
          <van-field v-model="form.password" type="password" label="密码" placeholder="请输入密码" :rules="[{ required: true }]" />
          <van-field v-model="form.confirmPassword" type="password" label="确认密码" placeholder="请再次输入密码" :rules="[{ required: true }]" />
          <van-field v-model="form.captchaCode" label="验证码" placeholder="请输入验证码" :rules="[{ required: true }]">
            <template #button>
              <img v-if="captchaUrl" :src="captchaUrl" class="captcha-img" alt="验证码" @click="refreshCaptcha" />
            </template>
          </van-field>
          <van-field v-model="form.email" label="邮箱" placeholder="可选，用于密码找回" />
        </van-cell-group>

        <van-notice-bar v-if="!form.email" left-icon="info-o" text="未绑定邮箱将无法找回密码" />

        <div style="padding: 16px">
          <van-button round block type="primary" native-type="submit" :loading="loading">注册</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { register, getCaptcha } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const inviteToken = route.params.token || route.query.invite || ''

const form = ref({ username: '', password: '', confirmPassword: '', captchaCode: '', captchaId: '', email: '' })
const captchaUrl = ref('')
const loading = ref(false)

async function refreshCaptcha() {
  try {
    const res = await getCaptcha()
    form.value.captchaId = res.data.captchaId
    captchaUrl.value = res.data.captchaImage
  } catch { /* 静默 */ }
}

async function handleRegister() {
  if (form.value.password !== form.value.confirmPassword) {
    showToast('两次密码不一致')
    return
  }
  loading.value = true
  try {
    await register({
      ...form.value,
      inviteToken
    })
    showToast('注册成功，请登录')
    router.replace({ name: 'Login', query: inviteToken ? { invite: inviteToken } : {} })
  } catch {
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(refreshCaptcha)
</script>

<style scoped>
.register-content { padding: var(--spacing-md) 0; }
.captcha-img { height: 32px; cursor: pointer; border-radius: var(--radius-sm); }
</style>
