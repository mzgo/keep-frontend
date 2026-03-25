<template>
  <div class="page-container">
    <van-nav-bar title="邀请打卡者" left-arrow @click-left="$router.back()" />
    <div class="content">
      <div class="card" style="text-align: center; padding: 32px 16px;">
        <van-icon name="friends-o" size="48" color="var(--color-primary)" />
        <p style="margin-top: 16px; color: var(--color-text-secondary);">生成邀请链接，分享给打卡者</p>
        <van-button round type="primary" style="margin-top: 24px;" :loading="loading" @click="generateLink">
          生成邀请链接
        </van-button>
        <van-field
          v-if="inviteLink"
          v-model="inviteLink"
          readonly
          label="邀请链接"
          style="margin-top: 16px"
        >
          <template #button>
            <van-button size="small" type="primary" @click="copyLink">复制</van-button>
          </template>
        </van-field>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import { generateInvite } from '@/api/manager'

const loading = ref(false)
const inviteLink = ref('')

async function generateLink() {
  loading.value = true
  try {
    const res = await generateInvite()
    inviteLink.value = `${window.location.origin}/invite/${res.data.inviteToken}`
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  if (!inviteLink.value) return
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    showSuccessToast('已复制邀请链接')
  } catch {
    showFailToast('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.content { padding: var(--spacing-md); }
</style>
