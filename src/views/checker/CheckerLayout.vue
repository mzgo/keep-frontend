<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'CheckerHome', title: '打卡', icon: 'todo-list-o' },
  { name: 'CheckerShop', title: '商城', icon: 'shop-o' },
  { name: 'CheckerHistory', title: '记录', icon: 'calendar-o' },
  { name: 'CheckerProfile', title: '我的', icon: 'user-o' },
]

const activeTab = ref(0)

function getActiveIndex(): number {
  const idx = tabs.findIndex((t) => t.name === route.name)
  return idx >= 0 ? idx : 0
}

activeTab.value = getActiveIndex()
</script>

<template>
  <div class="checker-layout">
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
.checker-layout {
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
