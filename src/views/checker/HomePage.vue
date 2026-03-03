<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getCheckinStatus, doCheckin } from '@/api/checkin'
import type { CheckinStatus } from '@/api/checkin'
import { getPointsSummary } from '@/api/points'
import type { PointsSummary } from '@/api/points'
import { compressImage } from '@/utils/image'

const status = ref<CheckinStatus | null>(null)
const pointsSummary = ref<PointsSummary | null>(null)
const checkinNote = ref('')
const showCheckinPanel = ref(false)
const selectedImage = ref<File | null>(null)
const previewUrl = ref('')
const submitting = ref(false)

async function loadStatus() {
  try {
    const [statusRes, pointsRes] = await Promise.all([
      getCheckinStatus(),
      getPointsSummary().catch(() => null),
    ])
    status.value = statusRes.data.data
    if (pointsRes) pointsSummary.value = pointsRes.data.data
  } catch {
    showToast('加载失败')
  }
}

function onSelectImage(item: any) {
  const file = Array.isArray(item) ? item[0]?.file : item?.file
  if (!file) return
  selectedImage.value = file
  previewUrl.value = URL.createObjectURL(file)
  showCheckinPanel.value = true
}

async function submitCheckin() {
  if (!selectedImage.value) {
    showToast('请选择照片')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '打卡中...', forbidClick: true, duration: 0 })

  try {
    // 压缩图片
    const compressed = await compressImage(selectedImage.value)
    await doCheckin(compressed, checkinNote.value || undefined)

    closeToast()
    showToast('打卡成功!')
    showCheckinPanel.value = false
    selectedImage.value = null
    previewUrl.value = ''
    checkinNote.value = ''
    await loadStatus()
  } catch (err: any) {
    closeToast()
    showToast(err.response?.data?.error || '打卡失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadStatus)
</script>

<template>
  <div class="checker-home">
    <van-nav-bar title="脂付宝" :border="false" />

    <div class="home-content" v-if="status">
      <!-- 积分概览条 -->
      <div class="points-bar" v-if="pointsSummary" @click="$router.push('/points-log')">
        <div class="points-main">
          <van-icon name="gold-coin-o" color="var(--keep-gold)" />
          <span class="points-value">{{ pointsSummary.available }}</span>
          <span class="points-label">积分</span>
        </div>
        <div class="points-expiry" v-if="pointsSummary.expiring_in_30_days > 0">
          {{ pointsSummary.expiring_in_30_days }}分即将过期
        </div>
        <van-icon name="arrow" size="14" color="#999" />
      </div>

      <!-- 连续打卡 & 周期进度 -->
      <div class="stats-card">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ status.consecutive_days }}</div>
            <div class="stat-label">连续打卡</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">{{ status.cycle_progress }}/{{ status.checkin_days }}</div>
            <div class="stat-label">本周期进度</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">{{ status.bonus_progress }}/{{ status.bonus_cycles }}</div>
            <div class="stat-label">全勤进度</div>
          </div>
        </div>

        <!-- 周期进度条 -->
        <div class="progress-section">
          <van-progress
            :percentage="(status.cycle_progress / status.checkin_days) * 100"
            :show-pivot="false"
            color="var(--keep-green)"
            track-color="#e8f5e9"
            stroke-width="8"
          />
          <div class="progress-tip" v-if="status.days_until_reward > 0">
            再坚持 {{ status.days_until_reward }} 天获得 {{ status.points_per_cycle }} 积分
          </div>
          <div class="progress-tip earned" v-else-if="status.consecutive_days > 0">
            本周期已完成，继续打卡进入下一周期!
          </div>
        </div>

        <!-- 额外奖励提示 -->
        <div class="bonus-tip" v-if="status.bonus_progress > 0">
          已完成 {{ status.bonus_progress }}/{{ status.bonus_cycles }} 次全勤，
          达到 {{ status.bonus_cycles }} 次额外奖励 {{ status.bonus_points }} 积分
        </div>
      </div>

      <!-- 打卡操作区 -->
      <div class="checkin-area">
        <div v-if="!status.checked_today" class="checkin-main">
          <van-uploader
            :after-read="onSelectImage"
            :max-count="1"
            :preview-image="false"
            accept="image/*"
            capture="environment"
          >
            <div class="checkin-button">
              <van-icon name="photograph" size="40" color="#fff" />
              <span>拍照打卡</span>
            </div>
          </van-uploader>
        </div>
        <div v-else class="checked-state">
          <van-icon name="passed" size="48" color="var(--keep-green)" />
          <div class="checked-text">今日已打卡</div>
          <div class="checked-date">{{ status.today_date }}</div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <van-loading size="36" color="var(--keep-green)" />
    </div>

    <!-- 打卡确认面板 -->
    <van-popup v-model:show="showCheckinPanel" position="bottom" round :style="{ maxHeight: '80%' }">
      <div class="checkin-panel">
        <div class="panel-header">
          <span>确认打卡</span>
          <van-icon name="cross" @click="showCheckinPanel = false" />
        </div>

        <div class="preview-image" v-if="previewUrl">
          <img :src="previewUrl" alt="打卡照片" />
        </div>

        <van-field
          v-model="checkinNote"
          type="textarea"
          placeholder="记录一下今天的心情（选填）"
          rows="2"
          autosize
          maxlength="200"
          show-word-limit
        />

        <div class="panel-actions">
          <van-button
            round
            block
            type="primary"
            :loading="submitting"
            @click="submitCheckin"
          >
            确认打卡
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.checker-home {
  background: var(--van-background);
  min-height: 100%;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
  font-weight: 600;
}

.home-content {
  padding: 16px;
}

.points-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.points-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.points-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--keep-gold);
}

.points-label {
  font-size: 13px;
  color: var(--van-text-color-2);
}

.points-expiry {
  font-size: 12px;
  color: #f57c00;
  background: #fff3e0;
  padding: 2px 8px;
  border-radius: 10px;
}

.stats-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--keep-green);
}

.stat-label {
  font-size: 12px;
  color: var(--van-text-color-3);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #eee;
}

.progress-section {
  margin-top: 20px;
}

.progress-tip {
  font-size: 13px;
  color: var(--van-text-color-2);
  margin-top: 8px;
  text-align: center;
}

.progress-tip.earned {
  color: var(--keep-green);
}

.bonus-tip {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff8e1;
  border-radius: 8px;
  font-size: 12px;
  color: #f57c00;
  text-align: center;
}

.checkin-area {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.checkin-main {
  width: 100%;
}

.checkin-button {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, var(--keep-green), var(--keep-green-light));
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
}

.checkin-button:active {
  transform: scale(0.98);
}

.checked-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
}

.checked-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--keep-green);
}

.checked-date {
  font-size: 13px;
  color: var(--van-text-color-3);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px;
}

/* 打卡确认面板 */
.checkin-panel {
  padding: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.preview-image {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.preview-image img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.panel-actions {
  margin-top: 16px;
}
</style>
