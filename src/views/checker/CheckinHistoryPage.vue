<template>
  <div class="page-container">
    <van-nav-bar title="打卡记录" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="viewMode" shrink>
      <van-tab title="日历" name="calendar" />
      <van-tab title="列表" name="list" />
    </van-tabs>
    <div class="content">
      <van-empty v-if="!records.length" description="暂无打卡记录" />
      <template v-else>
        <div v-if="viewMode === 'calendar'" class="calendar-simple">
          <van-tag v-for="item in records" :key="item.id" type="primary" plain>
            {{ item.checkinDate }}
          </van-tag>
        </div>
        <div v-else class="record-list">
          <div v-for="item in records" :key="item.id" class="record-item card">
            <div class="record-head">
              <strong>{{ item.checkinDate }}</strong>
              <span>{{ item.createdAt?.replace('T', ' ') }}</span>
            </div>
            <van-image v-if="item.photoUrl" :src="item.photoUrl" width="100%" height="160" fit="cover" radius="8" />
            <p v-if="item.note" class="note">{{ item.note }}</p>
          </div>
        </div>
      </template>
    </div>
    <van-tabbar route>
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
import { getCheckinHistory } from '@/api/checkin'
import { getSignedUrl } from '@/api/upload'

const viewMode = ref('calendar')
const records = ref([])

async function loadRecords() {
  const res = await getCheckinHistory()
  const raw = res.data || []
  records.value = await Promise.all(raw.map(async (item) => {
    let photoUrl = ''
    if (item.photoKey) {
      try {
        const urlRes = await getSignedUrl(item.photoKey)
        photoUrl = urlRes.data.url
      } catch {
        photoUrl = ''
      }
    }
    return { ...item, photoUrl }
  }))
}

onMounted(loadRecords)
</script>

<style scoped>
.content { padding: var(--spacing-md); padding-bottom: 80px; }
.calendar-simple {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
.record-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.record-item {
  padding: var(--spacing-sm);
}
.record-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: 12px;
}
.note {
  margin-top: var(--spacing-sm);
  color: var(--color-text-secondary);
}
</style>
