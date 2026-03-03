<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import { getShopPrizes, redeemPrize } from '@/api/prizes'
import type { ShopPrize } from '@/api/prizes'

const prizes = ref<ShopPrize[]>([])
const availablePoints = ref(0)
const loading = ref(false)

async function loadShop() {
  try {
    const { data } = await getShopPrizes()
    prizes.value = data.data
    availablePoints.value = data.available_points
  } catch {
    showToast('加载失败')
  }
}

async function onRedeem(prize: ShopPrize) {
  if (!prize.can_redeem) return

  try {
    await showConfirmDialog({
      title: '确认兑换',
      message: `兑换「${prize.name}」将消耗 ${prize.points_required} 积分`,
    })

    loading.value = true
    await redeemPrize(prize.id)
    showSuccessToast('兑换成功')
    await loadShop()
  } catch (err: any) {
    if (err !== 'cancel' && err?.message !== 'cancel') {
      showToast(err.response?.data?.error || '兑换失败')
    }
  } finally {
    loading.value = false
  }
}

function getPrizeStatus(prize: ShopPrize): { text: string; type: string } {
  if (prize.stock <= 0) return { text: '已兑完', type: 'sold-out' }
  if (prize.points_short > 0) return { text: `还差${prize.points_short}分`, type: 'insufficient' }
  return { text: '可兑换', type: 'available' }
}

onMounted(loadShop)
</script>

<template>
  <div class="shop-page">
    <van-nav-bar title="兑换商城" :border="false">
      <template #right>
        <span class="points-badge">{{ availablePoints }} 积分</span>
      </template>
    </van-nav-bar>

    <div class="shop-content">
      <div class="prize-grid" v-if="prizes.length > 0">
        <div
          v-for="prize in prizes"
          :key="prize.id"
          class="prize-card"
          :class="{ disabled: !prize.can_redeem }"
          @click="onRedeem(prize)"
        >
          <div class="prize-image-wrap">
            <van-image
              width="100%"
              height="120px"
              fit="cover"
              :src="prize.image_url || '/logo.png'"
            />
            <div class="prize-badge blind-box" v-if="prize.is_blind_box">盲盒</div>
            <div class="prize-badge sold-out" v-if="prize.stock <= 0">已兑完</div>
          </div>
          <div class="prize-info">
            <div class="prize-name">{{ prize.name }}</div>
            <div class="prize-bottom">
              <span class="prize-points">{{ prize.points_required }} 积分</span>
              <van-tag
                :type="prize.can_redeem ? 'success' : 'default'"
                size="medium"
              >
                {{ getPrizeStatus(prize).text }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无奖品" />
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  background: var(--van-background);
  min-height: 100%;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

.points-badge {
  color: var(--keep-gold-light);
  font-size: 13px;
  font-weight: 600;
}

.shop-content {
  padding: 12px;
}

.prize-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.prize-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: opacity 0.2s;
}

.prize-card.disabled {
  opacity: 0.6;
}

.prize-image-wrap {
  position: relative;
}

.prize-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
}

.prize-badge.blind-box {
  background: #FF9800;
}

.prize-badge.sold-out {
  background: rgba(0, 0, 0, 0.6);
}

.prize-info {
  padding: 8px 10px 10px;
}

.prize-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prize-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.prize-points {
  color: var(--keep-gold);
  font-size: 14px;
  font-weight: 600;
}
</style>
