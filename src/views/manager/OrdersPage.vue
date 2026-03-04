<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { getManagerOrders, verifyOrder } from '@/api/orders'
import type { ManagerOrder } from '@/api/orders'
import { Html5Qrcode } from 'html5-qrcode'

const orderList = ref<ManagerOrder[]>([])
const activeTab = ref('')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const showScanner = ref(false)
const manualCode = ref('')
const verifying = ref(false)
const scannerMode = ref<'camera' | 'manual'>('manual')
const cameraActive = ref(false)
let html5Qrcode: Html5Qrcode | null = null

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

async function doVerify(code: string) {
  if (!code.trim() || verifying.value) return
  verifying.value = true
  try {
    await stopCamera()
    const { data } = await verifyOrder(code.trim())
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

function onVerify() {
  doVerify(manualCode.value)
}

async function stopCamera() {
  if (html5Qrcode) {
    try { await html5Qrcode.stop() } catch { /* 已停止 */ }
    try { html5Qrcode.clear() } catch { /* 已清理 */ }
    html5Qrcode = null
  }
  cameraActive.value = false
}

async function startCamera() {
  await nextTick()
  const el = document.getElementById('qr-reader')
  if (!el) return

  html5Qrcode = new Html5Qrcode('qr-reader')
  try {
    await html5Qrcode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => { doVerify(decodedText) },
      () => {},
    )
    cameraActive.value = true
  } catch {
    // 摄像头不可用，回退到手动输入
    showToast('无法启动摄像头，请手动输入或选择图片')
    scannerMode.value = 'manual'
    html5Qrcode = null
  }
}

// 从图片文件识别二维码
async function onSelectQrImage(item: any) {
  const file = Array.isArray(item) ? item[0]?.file : item?.file
  if (!file) return
  try {
    const qr = new Html5Qrcode('qr-reader-hidden')
    const result = await qr.scanFile(file, false)
    qr.clear()
    doVerify(result)
  } catch {
    showToast('未识别到二维码，请重新选择')
  }
}

async function openScanner() {
  manualCode.value = ''
  scannerMode.value = 'manual'
  showScanner.value = true

  // 自动检测摄像头并尝试启动
  try {
    const devices = await Html5Qrcode.getCameras()
    if (devices && devices.length > 0) {
      scannerMode.value = 'camera'
      await nextTick()
      startCamera()
    }
  } catch {
    // 无摄像头权限或不支持，保持手动模式
  }
}

watch(showScanner, (val) => {
  if (!val) stopCamera()
})

onBeforeUnmount(stopCamera)
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
    <van-popup v-model:show="showScanner" position="bottom" round :style="{ maxHeight: '90%' }" @closed="stopCamera">
      <div class="scanner-popup">
        <van-nav-bar title="核销订单" left-text="关闭" @click-left="showScanner = false" />

        <!-- 模式切换 -->
        <van-tabs v-model:active="scannerMode" @change="(name: string) => name === 'camera' ? startCamera() : stopCamera()">
          <van-tab title="扫码" name="camera" />
          <van-tab title="手动输入" name="manual" />
        </van-tabs>

        <!-- 摄像头扫码区 -->
        <div v-show="scannerMode === 'camera'" class="camera-area">
          <div id="qr-reader"></div>
          <p v-if="!cameraActive" class="scanner-tip">正在启动摄像头...</p>
        </div>

        <!-- 手动输入区 -->
        <div v-show="scannerMode === 'manual'" class="manual-area">
          <van-field
            v-model="manualCode"
            label="核销码"
            placeholder="输入核销码"
            clearable
          />

          <div class="manual-actions">
            <van-button type="primary" block :loading="verifying" @click="onVerify">
              核销
            </van-button>
          </div>

          <div class="image-scan-section">
            <p class="scanner-tip">或者选择二维码图片识别：</p>
            <van-uploader :after-read="onSelectQrImage" :max-count="1" accept="image/*" :preview-image="false">
              <van-button size="small" plain type="primary" icon="photo-o">选择图片</van-button>
            </van-uploader>
          </div>
        </div>
      </div>
    </van-popup>
    <!-- html5-qrcode scanFile 需要一个隐藏的容器 -->
    <div id="qr-reader-hidden" style="display:none;"></div>
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

.scanner-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.scanner-popup :deep(.van-nav-bar) {
  background: #fff;
}

.scanner-popup :deep(.van-nav-bar__title) {
  color: var(--van-text-color);
}

.camera-area {
  padding: 16px;
  min-height: 300px;
}

.camera-area :deep(#qr-reader) {
  border: none !important;
}

.camera-area :deep(#qr-reader__scan_region) {
  min-height: 250px;
}

.manual-area {
  padding: 16px;
}

.manual-actions {
  margin-top: 16px;
}

.image-scan-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.scanner-tip {
  font-size: 12px;
  color: var(--van-text-color-3);
}
</style>
