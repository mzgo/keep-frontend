<template>
  <div class="page-container">
    <van-nav-bar title="规则配置" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset title="打卡周期">
        <van-field v-model="config.streakDays" type="digit" label="连续打卡天数" placeholder="默认5" />
        <van-field v-model="config.pointsPerCycle" type="digit" label="每周期积分" placeholder="默认1" />
      </van-cell-group>
      <van-cell-group inset title="额外奖励">
        <van-field v-model="config.bonusFullCount" type="digit" label="全勤次数" placeholder="默认3" />
        <van-field v-model="config.bonusPoints" type="digit" label="额外积分" placeholder="默认1" />
      </van-cell-group>
      <van-cell-group inset title="积分有效期">
        <van-field v-model="config.pointsValidity" type="digit" label="有效天数" placeholder="默认365" />
      </van-cell-group>
      <van-cell-group inset title="惩罚机制">
        <van-field v-model="config.penaltyDays" type="digit" label="触发天数" placeholder="默认10" />
        <van-field v-model="config.penaltyPoints" type="digit" label="扣减积分" placeholder="默认1" />
      </van-cell-group>
      <van-cell-group inset title="系统设置">
        <van-field v-model="config.resetHour" type="digit" label="每日重置时间" placeholder="默认5（凌晨5点）" />
      </van-cell-group>
      <div style="padding: 24px 16px">
        <van-button round block type="primary" :loading="loading" @click="handleSave">保存配置</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { getConfig, saveConfig } from '@/api/manager'

const config = ref({
  streakDays: 5,
  pointsPerCycle: 1,
  bonusFullCount: 3,
  bonusPoints: 1,
  pointsValidity: 365,
  penaltyDays: 10,
  penaltyPoints: 1,
  resetHour: 5
})
const loading = ref(false)

async function loadConfig() {
  const res = await getConfig()
  config.value = { ...config.value, ...res.data }
}

async function handleSave() {
  loading.value = true
  try {
    await saveConfig({
      ...config.value,
      streakDays: Number(config.value.streakDays),
      pointsPerCycle: Number(config.value.pointsPerCycle),
      bonusFullCount: Number(config.value.bonusFullCount),
      bonusPoints: Number(config.value.bonusPoints),
      pointsValidity: Number(config.value.pointsValidity),
      penaltyDays: Number(config.value.penaltyDays),
      penaltyPoints: Number(config.value.penaltyPoints),
      resetHour: Number(config.value.resetHour)
    })
    showSuccessToast('配置已保存')
  } finally {
    loading.value = false
  }
}

onMounted(loadConfig)
</script>

<style scoped>
.content { padding: var(--spacing-md) 0; }
</style>
