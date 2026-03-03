<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import QRCode from 'qrcode'
import { getMyOrders, cancelCheck, cancelOrder } from '@/api/orders'
import type { Order } from '@/api/orders'

const router = useRouter()
const orderList = ref<Order[]>([])
const activeTab = ref('')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const showQrCode = ref(false)
const qrCodeUrl = ref('')
const qrOrderName = ref('')

const tabs = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待核销' },
  { value: 'verified', label: '已核销' },
  { value: 'cancelled', label: '已取消' },
]

const statusMap: Record<string, { text: string; type: 'primary' | 'success' | 'danger' | 'default' }> = {
  pending: { text: '待核销', type: 'primary' },
  verified: { text: '已核销', type: 'success' },
  cancelled: { text: '已取消', type: 'default' },
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

async function loadOrders() {
  if (loading.value) return
  loading.value = true
  try {
    const { data } = await getMyOrders(activeTab.value || undefined, page.value)
    if (data.data.length < 20) finished.value = true
    orderList.value.push(...data.data)
    page.value++
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function resetAndLoad() {
  orderList.value = []
  page.value = 1
  finished.value = false
  loadOrders()
}

async function showQr(order: Order) {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(order.verify_code, {
      width: 240,
      margin: 2,
      color: { dark: '#2E7D32' },
    })
    qrOrderName.value = order.prize_name
    showQrCode.value = true
  } catch {
    showToast('生成二维码失败')
  }
}

async function onCancel(order: Order) {
  try {
    const { data: checkResult } = await cancelCheck(order.id)
    const check = checkResult.data

    let message = `取消兑换「${order.prize_name}」，将还原 ${check.refundable_points} 积分`
    if (check.has_expired) {
      message += `\n\n注意：其中 ${check.expired_points} 积分已过期，取消后不会还原`
    }

    await showConfirmDialog({ title: '确认取消兑换？', message })

    await cancelOrder(order.id)
    showSuccessToast('取消成功')
    resetAndLoad()
  } catch (err: any) {
    if (err !== 'cancel' && err?.message !== 'cancel') {
      showToast(err.response?.data?.error || '操作失败')
    }
  }
}

watch(activeTab, resetAndLoad)
onMounted(loadOrders)
</script>

<template>
  <div class="orders-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="router.back()" />

    <van-tabs v-model:active="activeTab" shrink sticky>
      <van-tab v-for="tab in tabs" :key="tab.value" :title="tab.label" :name="tab.value" />
    </van-tabs>

    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders">
      <div class="order-card" v-for="order in orderList" :key="order.id">
        <div class="order-header">
          <van-tag :type="statusMap[order.status]?.type || 'default'">
            {{ statusMap[order.status]?.text || order.status }}
          </van-tag>
          <span class="order-time">{{ formatTime(order.created_at) }}</span>
        </div>

        <div class="order-body">
          <van-image
            width="60px"
            height="60px"
            radius="8"
            fit="cover"
            :src="order.prize_image_url || '/logo.png'"
          />
          <div class="order-info">
            <div class="order-name">{{ order.prize_name }}</div>
            <div class="order-points">{{ order.points_spent }} 积分</div>
          </div>
        </div>

        <div class="order-actions" v-if="order.status === 'pending'">
          <van-button size="small" plain @click="onCancel(order)">取消兑换</van-button>
          <van-button size="small" type="primary" @click="showQr(order)">核销二维码</van-button>
        </div>
      </div>

      <van-empty v-if="!loading && orderList.length === 0" description="暂无订单" />
    </van-list>

    <!-- QR码弹窗 -->
    <van-dialog v-model:show="showQrCode" :title="qrOrderName" :show-confirm-button="false">
      <div class="qr-content">
        <img :src="qrCodeUrl" alt="核销码" class="qr-image" />
        <p class="qr-tip">请让管理者扫描此二维码完成核销</p>
      </div>
    </van-dialog>
  </div>
</template>

<style scoped>
.orders-page {
  background: var(--van-background);
  min-height: 100vh;
}

.order-card {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-time {
  font-size: 12px;
  color: var(--van-text-color-3);
}

.order-body {
  display: flex;
  gap: 12px;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.order-name {
  font-size: 15px;
  font-weight: 500;
}

.order-points {
  font-size: 13px;
  color: var(--keep-gold);
  margin-top: 4px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.qr-content {
  text-align: center;
  padding: 20px;
}

.qr-image {
  width: 200px;
  height: 200px;
}

.qr-tip {
  font-size: 13px;
  color: var(--van-text-color-3);
  margin-top: 12px;
}
</style>
