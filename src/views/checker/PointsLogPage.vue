<template>
  <div class="page-container">
    <van-nav-bar title="积分明细" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-empty v-if="!rows.length" description="暂无积分记录" />
      <van-cell-group v-else inset>
        <van-cell v-for="row in rows" :key="row.id" :title="row.remark || row.type" :label="row.createdAt?.replace('T', ' ')">
          <template #value>
            <span :class="row.amount >= 0 ? 'plus' : 'minus'">{{ row.amount > 0 ? `+${row.amount}` : row.amount }}</span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getPointsTransactions } from '@/api/points'

const rows = ref([])

async function loadRows() {
  const res = await getPointsTransactions()
  rows.value = res.data || []
}

onMounted(loadRows)
</script>

<style scoped>
.content { padding: var(--spacing-md); }
.plus { color: var(--color-success); }
.minus { color: var(--color-danger); }
</style>
