<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { showToast, showImagePreview } from 'vant'
import { getCheckinCalendar, getCheckinHistory } from '@/api/checkin'
import type { CalendarDay, CheckinRecord } from '@/api/checkin'

const viewMode = ref<'calendar' | 'list'>('calendar')

// 日历相关
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const calendarDays = ref<CalendarDay[]>([])
const checkinDateSet = ref<Map<string, string>>(new Map())

// 列表相关
const historyList = ref<CheckinRecord[]>([])
const listPage = ref(1)
const listLoading = ref(false)
const listFinished = ref(false)

const monthLabel = computed(() => `${currentYear.value}年${currentMonth.value}月`)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 生成日历网格
const calendarGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const grid: Array<{ day: number; date: string; hasCheckin: boolean; imageUrl: string }> = []

  // 空白填充
  for (let i = 0; i < firstDay; i++) {
    grid.push({ day: 0, date: '', hasCheckin: false, imageUrl: '' })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const imageUrl = checkinDateSet.value.get(date) || ''
    grid.push({ day: d, date, hasCheckin: !!imageUrl, imageUrl })
  }

  return grid
})

async function loadCalendar() {
  try {
    const { data } = await getCheckinCalendar(
      String(currentYear.value),
      String(currentMonth.value)
    )
    calendarDays.value = data.data
    const map = new Map<string, string>()
    for (const d of data.data) {
      map.set(d.date, d.image_url)
    }
    checkinDateSet.value = map
  } catch {
    showToast('加载日历失败')
  }
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
}

function onDayClick(item: { date: string; imageUrl: string; hasCheckin: boolean }) {
  if (item.hasCheckin && item.imageUrl) {
    showImagePreview({ images: [item.imageUrl], closeable: true })
  }
}

// 列表视图
async function loadHistory() {
  if (listLoading.value) return
  listLoading.value = true
  try {
    const { data } = await getCheckinHistory(listPage.value)
    if (data.data.length < 30) listFinished.value = true
    historyList.value.push(...data.data)
    listPage.value++
  } catch {
    showToast('加载失败')
  } finally {
    listLoading.value = false
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

watch([currentYear, currentMonth], loadCalendar)
onMounted(() => {
  loadCalendar()
  loadHistory()
})
</script>

<template>
  <div class="history-page">
    <van-nav-bar title="打卡记录" :border="false">
      <template #right>
        <van-icon
          :name="viewMode === 'calendar' ? 'bars' : 'calendar-o'"
          size="20"
          color="#fff"
          @click="viewMode = viewMode === 'calendar' ? 'list' : 'calendar'"
        />
      </template>
    </van-nav-bar>

    <!-- 日历视图 -->
    <div class="calendar-view" v-if="viewMode === 'calendar'">
      <div class="calendar-header">
        <van-icon name="arrow-left" @click="prevMonth" />
        <span class="month-label">{{ monthLabel }}</span>
        <van-icon name="arrow" @click="nextMonth" />
      </div>

      <div class="calendar-weekdays">
        <span v-for="w in weekDays" :key="w" class="weekday">{{ w }}</span>
      </div>

      <div class="calendar-grid">
        <div
          v-for="(item, idx) in calendarGrid"
          :key="idx"
          class="calendar-cell"
          :class="{ 'has-checkin': item.hasCheckin, empty: item.day === 0 }"
          @click="onDayClick(item)"
        >
          <template v-if="item.day > 0">
            <div class="cell-day">{{ item.day }}</div>
            <div class="cell-thumb" v-if="item.hasCheckin">
              <van-image
                width="100%"
                height="100%"
                fit="cover"
                :src="item.imageUrl"
                :radius="4"
              />
            </div>
            <div class="cell-dot" v-if="item.hasCheckin" />
          </template>
        </div>
      </div>

      <div class="calendar-stats">
        本月打卡 {{ calendarDays.length }} 天
      </div>
    </div>

    <!-- 列表视图 -->
    <div class="list-view" v-else>
      <van-list
        v-model:loading="listLoading"
        :finished="listFinished"
        finished-text="没有更多了"
        @load="loadHistory"
      >
        <div class="history-item" v-for="record in historyList" :key="record.id">
          <div class="item-date">{{ record.checkin_date }}</div>
          <div class="item-content">
            <van-image
              width="80px"
              height="80px"
              radius="8"
              fit="cover"
              :src="record.image_url"
              @click="showImagePreview({ images: [record.image_url], closeable: true })"
            />
            <div class="item-info">
              <div class="item-note" v-if="record.note">{{ record.note }}</div>
              <div class="item-time">{{ formatDate(record.created_at) }}</div>
            </div>
          </div>
        </div>

        <van-empty v-if="!listLoading && historyList.length === 0" description="暂无打卡记录" />
      </van-list>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  background: var(--van-background);
  min-height: 100%;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

/* 日历视图 */
.calendar-view {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 12px;
}

.month-label {
  font-size: 16px;
  font-weight: 600;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.weekday {
  font-size: 12px;
  color: var(--van-text-color-3);
  padding: 4px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.calendar-cell.has-checkin {
  background: #e8f5e9;
}

.cell-day {
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
}

.calendar-cell.has-checkin .cell-day {
  color: var(--keep-green);
  font-weight: 700;
}

.cell-thumb {
  position: absolute;
  inset: 2px;
  opacity: 0.3;
  border-radius: 6px;
  overflow: hidden;
}

.cell-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--keep-green);
  margin-top: 2px;
  z-index: 1;
}

.calendar-stats {
  text-align: center;
  padding-top: 12px;
  font-size: 13px;
  color: var(--van-text-color-2);
}

/* 列表视图 */
.list-view {
  padding: 12px;
}

.history-item {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}

.item-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--keep-green);
  margin-bottom: 8px;
}

.item-content {
  display: flex;
  gap: 12px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-note {
  font-size: 14px;
  color: var(--van-text-color);
  line-height: 1.5;
}

.item-time {
  font-size: 12px;
  color: var(--van-text-color-3);
}
</style>
