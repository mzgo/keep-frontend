<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { getCaptcha, register } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const inviteCode = computed(() => (route.params.inviteCode as string) || '')
const isChecker = computed(() => !!inviteCode.value)

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
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

function validateConfirmPassword(val: string) {
  return val === form.value.password ? '' : '两次密码输入不一致'
}

async function onSubmit() {
  if (form.value.password !== form.value.confirmPassword) {
    showToast('两次密码输入不一致')
    return
  }

  loading.value = true
  try {
    const { data } = await register({
      username: form.value.username,
      password: form.value.password,
      captcha_id: captchaId.value,
      captcha_text: form.value.captchaText,
      email: form.value.email || undefined,
      role: isChecker.value ? 'checker' : 'manager',
      invite_code: inviteCode.value || undefined,
    })

    auth.setTokens(data.data.access_token, data.data.refresh_token)
    auth.setUser(data.data.user)

    showToast('注册成功')
    router.replace(data.data.user.role === 'manager' ? '/manager' : '/checker')
  } catch (err: any) {
    const msg = err.response?.data?.error || '注册失败'
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
  <div class="register-page">
    <van-nav-bar
      :title="isChecker ? '打卡者注册' : '管理者注册'"
      left-arrow
      @click-left="router.back()"
    />

    <div class="register-content">
      <van-notice-bar
        v-if="isChecker"
        left-icon="info-o"
        :text="`你将通过邀请码注册为打卡者`"
      />

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="3-20个字符"
            :rules="[
              { required: true, message: '请输入用户名' },
              { pattern: /^.{3,20}$/, message: '长度3-20个字符' },
            ]"
            autocomplete="username"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="至少6个字符"
            :rules="[
              { required: true, message: '请输入密码' },
              { pattern: /^.{6,}$/, message: '至少6个字符' },
            ]"
            autocomplete="new-password"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validateConfirmPassword, message: '两次密码不一致' },
            ]"
            autocomplete="new-password"
          />
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="选填"
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

        <div class="register-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            注册
          </van-button>
          <div class="register-links">
            <router-link to="/login" class="link">已有账号？去登录</router-link>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
.register-content {
  padding: 16px 0;
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

.register-actions {
  padding: 24px 16px 0;
}

.register-links {
  text-align: center;
  margin-top: 16px;
}

.link {
  color: var(--keep-green);
  font-size: 14px;
  text-decoration: none;
}
</style>
