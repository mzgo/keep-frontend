<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { updateConfig } from '@/api/manager'

const router = useRouter()
const step = ref(0)
const loading = ref(false)

const form = ref({
  checkin_days: 5,
  points_per_cycle: 1,
  bonus_cycles: 3,
  bonus_points: 1,
  points_expiry_days: 365,
  penalty_inactive_days: 10,
  penalty_points: 1,
  day_reset_hour: 5,
})

function nextStep() {
  step.value++
}

function prevStep() {
  if (step.value > 0) step.value--
}

async function onFinish() {
  loading.value = true
  try {
    await updateConfig(form.value)
    showToast('配置完成')
    router.replace('/manager')
  } catch (err: any) {
    showToast(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="setup-wizard">
    <van-nav-bar title="初始配置" :border="false" />

    <van-steps :active="step" style="padding: 16px;">
      <van-step>打卡规则</van-step>
      <van-step>额外奖励</van-step>
      <van-step>其他设置</van-step>
    </van-steps>

    <div class="step-content">
      <!-- 第一步：打卡规则 -->
      <div v-show="step === 0">
        <van-cell-group inset>
          <van-field
            v-model.number="form.checkin_days"
            type="digit"
            label="连续打卡天数"
            placeholder="达到后获得积分"
          >
            <template #extra><span class="field-hint">天/周期</span></template>
          </van-field>
          <van-field
            v-model.number="form.points_per_cycle"
            type="digit"
            label="每周期积分"
            placeholder="每个周期获得积分数"
          >
            <template #extra><span class="field-hint">分/周期</span></template>
          </van-field>
        </van-cell-group>
        <div class="step-tip">
          打卡者连续打卡 {{ form.checkin_days }} 天，获得 {{ form.points_per_cycle }} 个积分
        </div>
        <div class="step-actions">
          <van-button round block type="primary" @click="nextStep">下一步</van-button>
        </div>
      </div>

      <!-- 第二步：额外奖励 -->
      <div v-show="step === 1">
        <van-cell-group inset>
          <van-field
            v-model.number="form.bonus_cycles"
            type="digit"
            label="全勤周期数"
            placeholder="连续几个全勤周期"
          >
            <template #extra><span class="field-hint">次全勤</span></template>
          </van-field>
          <van-field
            v-model.number="form.bonus_points"
            type="digit"
            label="额外积分"
            placeholder="额外奖励积分数"
          >
            <template #extra><span class="field-hint">分/次</span></template>
          </van-field>
        </van-cell-group>
        <div class="step-tip">
          连续 {{ form.bonus_cycles }} 个全勤周期，额外奖励 {{ form.bonus_points }} 个积分
        </div>
        <div class="step-actions two-buttons">
          <van-button round plain @click="prevStep">上一步</van-button>
          <van-button round type="primary" @click="nextStep">下一步</van-button>
        </div>
      </div>

      <!-- 第三步：其他设置 -->
      <div v-show="step === 2">
        <van-cell-group inset>
          <van-field
            v-model.number="form.points_expiry_days"
            type="digit"
            label="积分有效期"
          >
            <template #extra><span class="field-hint">天</span></template>
          </van-field>
          <van-field
            v-model.number="form.penalty_inactive_days"
            type="digit"
            label="惩罚天数"
            placeholder="连续未打卡天数"
          >
            <template #extra><span class="field-hint">天未打卡</span></template>
          </van-field>
          <van-field
            v-model.number="form.penalty_points"
            type="digit"
            label="扣除积分"
          >
            <template #extra><span class="field-hint">分</span></template>
          </van-field>
          <van-field
            v-model.number="form.day_reset_hour"
            type="digit"
            label="日期重置时间"
          >
            <template #extra><span class="field-hint">点 (凌晨)</span></template>
          </van-field>
        </van-cell-group>
        <div class="step-tip">
          积分 {{ form.points_expiry_days }} 天后过期；连续 {{ form.penalty_inactive_days }} 天未打卡扣 {{ form.penalty_points }} 积分
        </div>
        <div class="step-actions two-buttons">
          <van-button round plain @click="prevStep">上一步</van-button>
          <van-button round type="primary" :loading="loading" @click="onFinish">完成配置</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-wizard {
  background: var(--van-background);
  min-height: 100vh;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

.step-content {
  padding: 16px 0;
}

.field-hint {
  color: var(--van-text-color-3);
  font-size: 12px;
  white-space: nowrap;
}

.step-tip {
  padding: 12px 24px;
  color: var(--van-text-color-2);
  font-size: 13px;
  line-height: 1.6;
}

.step-actions {
  padding: 24px 16px;
}

.two-buttons {
  display: flex;
  gap: 12px;
}

.two-buttons .van-button {
  flex: 1;
}
</style>
