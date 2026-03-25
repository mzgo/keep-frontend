<template>
  <div class="page-container">
    <div class="home-header">
      <h2 class="home-greeting">Hi, {{ auth.user?.nickname || '打卡者' }}</h2>
      <p class="home-date">{{ todayStr }}</p>
    </div>

    <!-- 周期进度卡片 -->
    <div class="card progress-card">
      <div class="progress-title">打卡周期进度</div>
      <van-progress :percentage="cyclePercent" :pivot-text="`${cycleDay}/${streakDays}`" color="var(--color-primary)" track-color="var(--color-primary-bg)" stroke-width="8" />
      <p class="progress-hint">还差 <span class="points-value">{{ streakDays - cycleDay }}</span> 天可获得 <span class="points-value">{{ pointsPerCycle }}</span> 积分</p>
    </div>

    <!-- 简化日历概览 -->
    <div class="card">
      <div class="section-title">打卡日历</div>
      <div class="calendar-placeholder">近期打卡概览可在“记录”页查看</div>
    </div>

    <!-- 打卡按钮 -->
    <div class="checkin-area">
      <van-button
        v-if="!checkedIn"
        round
        type="primary"
        size="large"
        class="checkin-btn"
        :loading="checkingIn"
        @click="triggerFilePicker"
      >
        立即打卡
      </van-button>
      <div v-else class="checked-badge">
        <van-icon name="passed" size="24" />
        <span>今日已打卡</span>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handleFileSelected"
      />
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="calendar-o" to="/history">记录</van-tabbar-item>
      <van-tabbar-item icon="shop-o" to="/shop">商城</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { submitCheckin, getTodayStatus } from '@/api/checkin'
import { compressImage } from '@/utils/image'
import { getUploadToken, uploadToQiniu } from '@/api/upload'
import { useAuthStore } from '@/stores/auth'
import { getCheckinDate } from '@/utils/date'

const auth = useAuthStore()

const activeTab = ref(0)
const checkedIn = ref(false)
const checkingIn = ref(false)
const fileInputRef = ref(null)
const todayStr = getCheckinDate()

const cycleDay = ref(0)
const streakDays = ref(5)
const pointsPerCycle = ref(1)
const cyclePercent = ref(0)

async function loadDashboard() {
  const res = await getTodayStatus()
  const data = res.data || {}
  checkedIn.value = !!data.checkedInToday
  cycleDay.value = data.cycleDay || 0
  streakDays.value = data.streakDays || 5
  pointsPerCycle.value = data.pointsPerCycle || 1
  cyclePercent.value = Math.floor((cycleDay.value / Math.max(streakDays.value, 1)) * 100)
}

function triggerFilePicker() {
  fileInputRef.value?.click()
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  checkingIn.value = true
  try {
    const compressed = await compressImage(file)
    const tokenRes = await getUploadToken('checkin')
    const uploadToken = tokenRes.data.uploadToken
    const key = tokenRes.data.fileKey
    await uploadToQiniu(compressed, uploadToken, key)

    await submitCheckin({ photoKey: key, note: '' })
    showSuccessToast('打卡成功')
    await loadDashboard()
  } finally {
    checkingIn.value = false
    event.target.value = ''
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.home-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  padding: var(--spacing-xl) var(--spacing-md) var(--spacing-lg);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.home-greeting { font-size: 22px; font-weight: 600; }
.home-date { font-size: 13px; opacity: 0.85; margin-top: var(--spacing-xs); }
.progress-card { margin: var(--spacing-md); }
.progress-title { font-size: 14px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm); }
.progress-hint { font-size: 13px; color: var(--color-text-secondary); margin-top: var(--spacing-sm); }
.card { margin: var(--spacing-md); }
.section-title { font-size: 15px; font-weight: 600; margin-bottom: var(--spacing-sm); }
.calendar-placeholder {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
}
.checkin-area { padding: var(--spacing-lg) var(--spacing-md); text-align: center; }
.checkin-btn {
  width: 70%;
  height: 48px;
  font-size: 17px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(27, 125, 62, 0.3);
}
.checked-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary-bg);
  border-radius: var(--radius-round);
}
</style>
