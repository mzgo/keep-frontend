<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { getConfig, getConfigStatus, createInvitation, getCheckers, updateConfig } from '@/api/manager'
import type { ManagerConfig, CheckerInfo } from '@/api/manager'

const router = useRouter()
const config = ref<ManagerConfig | null>(null)
const checkers = ref<CheckerInfo[]>([])
const showConfigEdit = ref(false)
const showInviteResult = ref(false)
const inviteLink = ref('')
const loading = ref(false)

const editForm = ref({
  checkin_days: 5,
  points_per_cycle: 1,
  bonus_cycles: 3,
  bonus_points: 1,
  points_expiry_days: 365,
  penalty_inactive_days: 10,
  penalty_points: 1,
  day_reset_hour: 5,
})

async function loadData() {
  try {
    // 先检查是否已配置
    const { data: statusRes } = await getConfigStatus()
    if (!statusRes.data.is_configured) {
      router.replace('/manager/setup')
      return
    }

    const [configRes, checkersRes] = await Promise.all([getConfig(), getCheckers()])
    config.value = configRes.data.data
    checkers.value = checkersRes.data.data
  } catch {
    showToast('加载失败')
  }
}

function openConfigEdit() {
  if (config.value) {
    editForm.value = {
      checkin_days: config.value.checkin_days,
      points_per_cycle: config.value.points_per_cycle,
      bonus_cycles: config.value.bonus_cycles,
      bonus_points: config.value.bonus_points,
      points_expiry_days: config.value.points_expiry_days,
      penalty_inactive_days: config.value.penalty_inactive_days,
      penalty_points: config.value.penalty_points,
      day_reset_hour: config.value.day_reset_hour,
    }
  }
  showConfigEdit.value = true
}

async function saveConfig() {
  try {
    await updateConfig(editForm.value)
    showConfigEdit.value = false
    showSuccessToast('保存成功')
    await loadData()
  } catch (err: any) {
    showToast(err.response?.data?.error || '保存失败')
  }
}

async function onCreateInvite() {
  loading.value = true
  try {
    const { data } = await createInvitation()
    const baseUrl = window.location.origin
    inviteLink.value = `${baseUrl}/register/${data.data.code}`
    showInviteResult.value = true
  } catch (err: any) {
    showToast(err.response?.data?.error || '创建失败')
  } finally {
    loading.value = false
  }
}

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    showSuccessToast('已复制')
  } catch {
    showToast('复制失败，请手动复制')
  }
}

onMounted(loadData)
</script>

<template>
  <div class="manager-home">
    <van-nav-bar title="管理概览" :border="false" />

    <div class="home-content" v-if="config">
      <!-- 规则卡片 -->
      <van-cell-group inset title="当前规则">
        <van-cell title="连续打卡" :value="`${config.checkin_days} 天/周期`" />
        <van-cell title="每周期积分" :value="`${config.points_per_cycle} 分`" />
        <van-cell title="额外奖励" :value="`每 ${config.bonus_cycles} 次全勤 +${config.bonus_points} 分`" />
        <van-cell title="积分有效期" :value="`${config.points_expiry_days} 天`" />
        <van-cell title="惩罚规则" :value="`${config.penalty_inactive_days} 天未打卡扣 ${config.penalty_points} 分`" />
        <van-cell title="修改配置" is-link @click="openConfigEdit" />
      </van-cell-group>

      <!-- 打卡者列表 -->
      <van-cell-group inset title="打卡者" style="margin-top: 16px;">
        <van-cell
          v-for="checker in checkers"
          :key="checker.id"
          :title="checker.nickname"
          :label="checker.username"
        >
          <template #icon>
            <van-image
              round
              width="36px"
              height="36px"
              :src="checker.avatar_url || '/logo.png'"
              style="margin-right: 12px;"
            />
          </template>
        </van-cell>
        <van-empty v-if="checkers.length === 0" description="暂无打卡者" image="search" />
      </van-cell-group>

      <!-- 邀请按钮 -->
      <div class="invite-action">
        <van-button
          round
          block
          type="primary"
          icon="plus"
          :loading="loading"
          @click="onCreateInvite"
        >
          生成邀请链接
        </van-button>
      </div>
    </div>

    <!-- 配置编辑弹窗 -->
    <van-popup v-model:show="showConfigEdit" position="bottom" round :style="{ maxHeight: '80%' }">
      <div class="popup-header">
        <van-nav-bar title="修改配置" left-text="取消" right-text="保存" @click-left="showConfigEdit = false" @click-right="saveConfig" />
      </div>
      <div style="padding: 0 0 24px;">
        <van-cell-group>
          <van-field v-model.number="editForm.checkin_days" type="digit" label="连续打卡天数" />
          <van-field v-model.number="editForm.points_per_cycle" type="digit" label="每周期积分" />
          <van-field v-model.number="editForm.bonus_cycles" type="digit" label="全勤周期数" />
          <van-field v-model.number="editForm.bonus_points" type="digit" label="额外积分" />
          <van-field v-model.number="editForm.points_expiry_days" type="digit" label="积分有效期(天)" />
          <van-field v-model.number="editForm.penalty_inactive_days" type="digit" label="惩罚天数" />
          <van-field v-model.number="editForm.penalty_points" type="digit" label="扣除积分" />
          <van-field v-model.number="editForm.day_reset_hour" type="digit" label="日期重置时间" />
        </van-cell-group>
      </div>
    </van-popup>

    <!-- 邀请链接结果弹窗 -->
    <van-dialog
      v-model:show="showInviteResult"
      title="邀请链接已生成"
      confirm-button-text="复制链接"
      @confirm="copyInviteLink"
    >
      <div style="padding: 16px; word-break: break-all; font-size: 13px; color: #666;">
        {{ inviteLink }}
      </div>
      <div style="padding: 0 16px 8px; font-size: 12px; color: #999;">
        此链接为一次性链接，有人通过此链接注册后自动失效
      </div>
    </van-dialog>
  </div>
</template>

<style scoped>
.manager-home {
  background: var(--van-background);
  min-height: 100%;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

.home-content {
  padding: 16px 0;
}

.invite-action {
  padding: 24px 16px;
}

.popup-header :deep(.van-nav-bar) {
  background: #fff;
}

.popup-header :deep(.van-nav-bar__title) {
  color: var(--van-text-color);
}
</style>
