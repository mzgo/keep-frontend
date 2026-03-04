<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getPointsSummary, getPointsEvents } from '@/api/points'
import type { PointsSummary, PointsEvent } from '@/api/points'

const router = useRouter()
const summary = ref<PointsSummary | null>(null)
const events = ref<PointsEvent[]>([])
const page = ref(1)
const finished = ref(false)
const loading = ref(false)

const eventTypeMap: Record<string, { label: string; color: string; icon: string }> = {
  earn_checkin: { label: '打卡奖励', color: '#4CAF50', icon: 'todo-list-o' },
  earn_bonus: { label: '额外奖励', color: '#FF9800', icon: 'fire-o' },
  redeem: { label: '积分兑换', color: '#f44336', icon: 'shopping-cart-o' },
  cancel_redeem: { label: '取消兑换', color: '#2196F3', icon: 'replay' },
  expire: { label: '积分过期', color: '#9E9E9E', icon: 'clock-o' },
  penalty: { label: '惩罚扣分', color: '#f44336', icon: 'warning-o' },
}

function getEventInfo(type: string) {
  return eventTypeMap[type] || { label: type, color: '#999', icon: 'info-o' }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

async function loadSummary() {
  try {
    const { data } = await getPointsSummary()
    summary.value = data.data
  } catch {
    showToast('加载失败')
  }
}

async function loadMore() {
  if (loading.value) return
  loading.value = true
  try {
    const { data } = await getPointsEvents(page.value)
    if (data.data.length < 20) {
      finished.value = true
    }
    events.value.push(...data.data)
    page.value++
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadSummary)
</script>

<template>
  <div class="points-log-page">
    <van-nav-bar title="积分明细" left-arrow @click-left="router.back()" />

    <!-- 积分概览 -->
    <div class="points-summary" v-if="summary">
      <div class="summary-main">
        <div class="summary-value">{{ summary.available }}</div>
        <div class="summary-label">可用积分</div>
      </div>
      <div class="summary-warning" v-if="summary.expiring_in_30_days > 0">
        {{ summary.expiring_in_30_days }} 积分将在30天内过期
      </div>
    </div>

    <!-- 流水列表 -->
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadMore">
      <div class="event-item" v-for="event in events" :key="event.id">
        <div class="event-icon" :style="{ color: getEventInfo(event.event_type).color }">
          <van-icon :name="getEventInfo(event.event_type).icon" size="20" />
        </div>
        <div class="event-info">
          <div class="event-label">{{ getEventInfo(event.event_type).label }}</div>
          <div class="event-desc" v-if="event.description">{{ event.description }}</div>
          <div class="event-time">{{ formatTime(event.created_at) }}</div>
        </div>
        <div class="event-amount" :class="event.amount > 0 ? 'positive' : 'negative'">
          {{ event.amount > 0 ? '+' : '' }}{{ event.amount }}
        </div>
      </div>
    </van-list>
  </div>
</template>

<style scoped>
.points-log-page {
  background: var(--van-background);
  min-height: 100vh;
}

.points-summary {
  background: linear-gradient(135deg, var(--keep-green-dark), var(--keep-green));
  padding: 24px 16px;
  text-align: center;
}

.summary-main {
  color: #fff;
}

.summary-value {
  font-size: 36px;
  font-weight: 700;
}

.summary-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

.summary-warning {
  margin-top: 12px;
  padding: 6px 12px;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 16px;
  color: #FFD54F;
  font-size: 12px;
  display: inline-block;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.event-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-label {
  font-size: 14px;
  font-weight: 500;
}

.event-desc {
  font-size: 12px;
  color: var(--van-text-color-3);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 11px;
  color: var(--van-text-color-3);
  margin-top: 2px;
}

.event-amount {
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 12px;
}

.event-amount.positive {
  color: var(--keep-green);
}

.event-amount.negative {
  color: #f44336;
}
</style>
