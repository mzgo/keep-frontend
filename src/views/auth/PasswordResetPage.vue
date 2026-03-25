<template>
  <div class="page-container">
    <van-nav-bar title="找回密码" left-arrow @click-left="$router.back()" />

    <div class="content">
      <van-form @submit="handleRequest">
        <van-cell-group inset title="第一步：获取重置 Token">
          <van-field
            v-model="emailForm.email"
            label="邮箱"
            placeholder="请输入已绑定邮箱"
            :rules="[{ required: true, message: '请输入邮箱' }]"
          />
        </van-cell-group>
        <div class="actions">
          <van-button round block type="primary" native-type="submit" :loading="requesting">
            发送重置 Token
          </van-button>
        </div>
      </van-form>

      <van-form @submit="handleConfirm">
        <van-cell-group inset title="第二步：重置密码">
          <van-field
            v-model="resetForm.token"
            label="Token"
            placeholder="请输入邮件中的 token"
            :rules="[{ required: true, message: '请输入 token' }]"
          />
          <van-field
            v-model="resetForm.newPassword"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[{ required: true, message: '请输入新密码' }]"
          />
        </van-cell-group>
        <div class="actions">
          <van-button round block type="primary" native-type="submit" :loading="resetting">
            确认重置
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showSuccessToast } from 'vant'
import { requestPasswordReset, resetPassword } from '@/api/auth'

const requesting = ref(false)
const resetting = ref(false)
const emailForm = ref({ email: '' })
const resetForm = ref({ token: '', newPassword: '' })

async function handleRequest() {
  requesting.value = true
  try {
    await requestPasswordReset({ email: emailForm.value.email })
    showSuccessToast('重置 token 已发送，请检查邮箱')
  } finally {
    requesting.value = false
  }
}

async function handleConfirm() {
  resetting.value = true
  try {
    await resetPassword({
      token: resetForm.value.token,
      newPassword: resetForm.value.newPassword
    })
    showSuccessToast('密码重置成功，请重新登录')
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped>
.content {
  padding: var(--spacing-md) 0;
}
.actions {
  padding: var(--spacing-md);
}
</style>
