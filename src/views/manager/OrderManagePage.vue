<template>
  <div class="page-container">
    <van-nav-bar title="订单管理" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="statusFilter" shrink>
      <van-tab title="全部" name="ALL" />
      <van-tab title="待核销" name="PENDING" />
      <van-tab title="已核销" name="VERIFIED" />
      <van-tab title="已取消" name="CANCELLED" />
    </van-tabs>
    <div class="content">
      <van-empty v-if="!orders.length" description="暂无订单" />
      <van-cell-group v-else inset>
        <van-cell v-for="order in orders" :key="order.id" :title="order.prizeName" :label="`订单#${order.id} · ${order.pointsCost}积分`">
          <template #value>
            <van-tag :type="statusTag(order.status)">{{ order.status }}</van-tag>
            <van-button
              v-if="order.status === 'PENDING'"
              size="mini"
              type="primary"
              plain
              style="margin-left: 8px"
              @click="goVerify(order)"
            >
              去核销
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getManagerOrders } from '@/api/manager'

const router = useRouter()
const statusFilter = ref('ALL')
const orders = ref([])

function statusTag(status) {
  if (status === 'PENDING') return 'warning'
  if (status === 'VERIFIED') return 'success'
  if (status === 'CANCELLED') return 'default'
  return 'primary'
}

async function loadOrders() {
  const res = await getManagerOrders(statusFilter.value)
  orders.value = res.data || []
}

function goVerify(order) {
  router.push(`/verify/${order.id}/${order.verifyToken}`)
}

watch(statusFilter, loadOrders)
onMounted(loadOrders)
</script>

<style scoped>
.content { padding: var(--spacing-md); }
</style>
