<template>
  <div class="page-container">
    <van-nav-bar title="核销确认" left-arrow @click-left="$router.back()" />
    <div class="content" style="text-align: center; padding-top: 48px;">
      <van-icon name="scan" size="64" color="var(--color-primary)" />
      <p style="margin-top: 16px;">确认核销订单 #{{ orderId }}</p>
      <van-button type="primary" style="margin-top: 16px" :loading="verifying" @click="handleVerify">
        确认核销
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { verifyOrder } from '@/api/manager'

const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId
const token = route.params.token
const verifying = ref(false)

async function handleVerify() {
  verifying.value = true
  try {
    await verifyOrder(orderId, token)
    showSuccessToast('核销成功')
    router.replace('/manager/orders')
  } finally {
    verifying.value = false
  }
}
</script>

<style scoped>
.content { padding: var(--spacing-md); }
</style>
