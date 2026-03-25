<template>
  <div class="page-container">
    <van-nav-bar title="打卡监督" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-empty v-if="!checkers.length" description="暂无打卡者" />
      <van-cell-group v-else inset>
        <van-cell v-for="checker in checkers" :key="checker.id" :title="checker.nickname || checker.username" :label="checker.username" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getCheckers } from '@/api/manager'

const checkers = ref([])

async function loadCheckers() {
  const res = await getCheckers()
  checkers.value = res.data || []
}

onMounted(loadCheckers)
</script>

<style scoped>
.content { padding: var(--spacing-md); }
</style>
