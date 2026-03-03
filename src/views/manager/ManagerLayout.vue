<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'ManagerHome', title: '概览', icon: 'chart-trending-o' },
  { name: 'ManagerPrizes', title: '奖品', icon: 'gift-o' },
  { name: 'ManagerOrders', title: '订单', icon: 'orders-o' },
  { name: 'ManagerProfile', title: '我的', icon: 'user-o' },
]

const activeTab = ref(0)

function getActiveIndex(): number {
  const idx = tabs.findIndex((t) => t.name === route.name)
  return idx >= 0 ? idx : 0
}

activeTab.value = getActiveIndex()
</script>

<template>
  <div class="manager-layout">
    <div class="page-content">
      <router-view />
    </div>
    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        :icon="tab.icon"
      >
        {{ tab.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.manager-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
}
</style>
