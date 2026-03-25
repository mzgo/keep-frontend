<template>
  <div class="page-container">
    <van-nav-bar title="我的订单" />
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
            <van-tag :type="statusTag(order.status)" style="margin-right: 8px">{{ order.status }}</van-tag>
            <van-button
              v-if="order.status === 'PENDING'"
              size="mini"
              type="danger"
              plain
              @click="handleCancel(order.id)"
            >
              取消
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
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
import { onMounted, ref, watch } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { cancelOrder, getMyOrders } from '@/api/order'

const statusFilter = ref('ALL')
const orders = ref([])

function statusTag(status) {
  if (status === 'PENDING') return 'warning'
  if (status === 'VERIFIED') return 'success'
  if (status === 'CANCELLED') return 'default'
  return 'primary'
}

async function loadOrders() {
  const res = await getMyOrders(statusFilter.value)
  orders.value = res.data || []
}

async function handleCancel(orderId) {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '取消后会尝试还原积分和库存'
    })
    const res = await cancelOrder(orderId)
    if (res.data.expiredPointsAmount > 0) {
      showSuccessToast(`已取消，${res.data.expiredPointsAmount} 积分已过期`)
    } else {
      showSuccessToast('已取消')
    }
    await loadOrders()
  } catch {
    // 用户取消确认弹窗时不处理
  }
}

watch(statusFilter, loadOrders)
onMounted(loadOrders)
</script>

<style scoped>
.content { padding: var(--spacing-md); padding-bottom: 80px; }
</style>
