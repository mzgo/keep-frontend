<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { getManagerOrders, verifyOrder } from '@/api/orders'
import type { ManagerOrder } from '@/api/orders'

const orderList = ref<ManagerOrder[]>([])
const activeTab = ref('')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const showScanner = ref(false)
const manualCode = ref('')
const verifying = ref(false)

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
    const { data } = await getManagerOrders(activeTab.value || undefined, page.value)
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

async function onVerify() {
  const code = manualCode.value.trim()
  if (!code) {
    showToast('请输入核销码')
    return
  }

  verifying.value = true
  try {
    const { data } = await verifyOrder(code)
    showSuccessToast(`核销成功\n${data.data.user_nickname} - ${data.data.prize_name}`)
    showScanner.value = false
    manualCode.value = ''
    resetAndLoad()
  } catch (err: any) {
    showToast(err.response?.data?.error || '核销失败')
  } finally {
    verifying.value = false
  }
}

// 扫码功能：使用 input[type=file] capture 模拟扫码，实际用手动输入作为降级方案
// 完整的扫码功能可在后续集成 jsQR 或 html5-qrcode 库
function openScanner() {
  showScanner.value = true
}

watch(activeTab, resetAndLoad)
onMounted(loadOrders)
</script>

<template>
  <div class="orders-page">
    <van-nav-bar title="订单管理" :border="false">
      <template #right>
        <van-icon name="scan" size="20" color="#fff" @click="openScanner" />
      </template>
    </van-nav-bar>

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
          <div class="order-info">
            <div class="order-name">{{ order.prize_name }}</div>
            <div class="order-user">{{ order.user_nickname }}</div>
            <div class="order-points">{{ order.points_spent }} 积分</div>
          </div>
        </div>
      </div>

      <van-empty v-if="!loading && orderList.length === 0" description="暂无订单" />
    </van-list>

    <!-- 核销弹窗 -->
    <van-dialog
      v-model:show="showScanner"
      title="核销订单"
      show-cancel-button
      confirm-button-text="核销"
      :before-close="() => {}"
      @confirm="onVerify"
    >
      <div class="scanner-content">
        <van-field
          v-model="manualCode"
          label="核销码"
          placeholder="输入或扫描核销码"
          clearable
        />
        <p class="scanner-tip">请输入打卡者订单上的核销码</p>
      </div>
    </van-dialog>
  </div>
</template>

<style scoped>
.orders-page {
  background: var(--van-background);
  min-height: 100%;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
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
  margin-bottom: 8px;
}

.order-time {
  font-size: 12px;
  color: var(--van-text-color-3);
}

.order-info {
  flex: 1;
}

.order-name {
  font-size: 15px;
  font-weight: 500;
}

.order-user {
  font-size: 13px;
  color: var(--van-text-color-2);
  margin-top: 2px;
}

.order-points {
  font-size: 13px;
  color: var(--keep-gold);
  margin-top: 2px;
}

.scanner-content {
  padding: 16px;
}

.scanner-tip {
  font-size: 12px;
  color: var(--van-text-color-3);
  margin-top: 8px;
  padding: 0 16px;
}
</style>
