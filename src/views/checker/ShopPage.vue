<template>
  <div class="page-container">
    <van-nav-bar title="兑换商城" />
    <div class="points-banner">
      <span>当前积分</span>
      <span class="points-value">{{ points }}</span>
    </div>
    <div class="content">
      <van-empty v-if="!prizes.length" description="暂无奖品" />
      <div v-else class="prize-list">
        <div v-for="item in prizes" :key="item.id" class="card prize-item">
          <div class="prize-head">
            <strong>{{ item.name }}</strong>
            <van-tag :type="item.remainingStock > 0 ? 'success' : 'danger'">
              {{ item.remainingStock > 0 ? `库存 ${item.remainingStock}` : '已售罄' }}
            </van-tag>
          </div>
          <div class="prize-foot">
            <span>{{ item.requiredPoints }} 积分</span>
            <van-button
              size="small"
              type="primary"
              :disabled="item.remainingStock <= 0 || points < item.requiredPoints"
              @click="handleRedeem(item)"
            >
              兑换
            </van-button>
          </div>
        </div>
      </div>
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
import { showSuccessToast } from 'vant'
import { getPointsBalance } from '@/api/points'
import { getAvailablePrizes } from '@/api/prize'
import { redeemPrize } from '@/api/order'

const points = ref(0)
const prizes = ref([])

async function loadData() {
  const [pointsRes, prizesRes] = await Promise.all([
    getPointsBalance(),
    getAvailablePrizes()
  ])
  points.value = pointsRes.data.available || 0
  prizes.value = prizesRes.data || []
}

async function handleRedeem(item) {
  await redeemPrize(item.id)
  showSuccessToast('兑换成功')
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.points-banner {
  background: linear-gradient(135deg, var(--color-accent-dark), var(--color-accent));
  color: #fff;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}
.points-banner .points-value { font-size: 24px; font-weight: 700; }
.content { padding: var(--spacing-md); padding-bottom: 80px; }
.prize-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.prize-head, .prize-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.prize-foot {
  margin-top: var(--spacing-sm);
}
</style>
