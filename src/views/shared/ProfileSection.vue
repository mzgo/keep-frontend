<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, updatePassword, uploadAvatar, logout } from '@/api/auth'

const router = useRouter()
const auth = useAuthStore()

const showNicknameEdit = ref(false)
const newNickname = ref(auth.nickname)
const showPasswordEdit = ref(false)
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

// 弹窗打开时重置为当前昵称，避免取消后残留旧输入
watch(showNicknameEdit, (val) => {
  if (val) newNickname.value = auth.nickname
})

async function onAvatarChange(item: any) {
  const file = Array.isArray(item) ? item[0]?.file : item?.file
  if (!file) return
  try {
    const { data } = await uploadAvatar(file)
    auth.avatarUrl = data.data.avatar_url
    showToast('头像更新成功')
  } catch {
    showToast('头像上传失败')
  }
}

async function saveNickname() {
  if (!newNickname.value.trim()) {
    showToast('昵称不能为空')
    return
  }
  try {
    await updateProfile({ nickname: newNickname.value.trim() })
    auth.nickname = newNickname.value.trim()
    showNicknameEdit.value = false
    showToast('昵称修改成功')
  } catch {
    showToast('修改失败')
  }
}

async function savePassword() {
  const f = passwordForm.value
  if (!f.oldPassword || !f.newPassword) {
    showToast('请填写完整')
    return
  }
  if (f.newPassword.length < 6) {
    showToast('新密码至少6个字符')
    return
  }
  if (f.newPassword !== f.confirmPassword) {
    showToast('两次密码不一致')
    return
  }
  try {
    await updatePassword({ old_password: f.oldPassword, new_password: f.newPassword })
    showPasswordEdit.value = false
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    showToast('密码修改成功')
  } catch (err: any) {
    showToast(err.response?.data?.error || '修改失败')
  }
}

async function onLogout() {
  try {
    await showConfirmDialog({ title: '确认退出登录？' })
    await logout(auth.refreshToken).catch(() => {})
    auth.clearAuth()
    router.replace('/login')
  } catch {
    // 取消
  }
}
</script>

<template>
  <div class="profile-section">
    <!-- 头像与基本信息 -->
    <div class="profile-header">
      <van-uploader :after-read="onAvatarChange" :max-count="1" :preview-image="false">
        <van-image
          round
          width="64px"
          height="64px"
          fit="cover"
          :src="auth.avatarUrl || '/logo.png'"
        />
      </van-uploader>
      <div class="profile-info">
        <div class="profile-name">{{ auth.nickname || auth.username }}</div>
        <van-tag :type="auth.userRole === 'manager' ? 'warning' : 'success'" plain>
          {{ auth.userRole === 'manager' ? '管理者' : '打卡者' }}
        </van-tag>
      </div>
    </div>

    <!-- 快捷入口（打卡者） -->
    <van-cell-group inset v-if="auth.userRole === 'checker'" style="margin-top: 16px;">
      <van-cell title="积分明细" icon="gold-coin-o" is-link @click="router.push('/points-log')" />
      <van-cell title="我的订单" icon="orders-o" is-link @click="router.push('/orders')" />
    </van-cell-group>

    <!-- 信息列表 -->
    <van-cell-group inset title="个人信息" style="margin-top: 16px;">
      <van-cell title="用户名" :value="auth.username" />
      <van-cell title="昵称" :value="auth.nickname" is-link @click="showNicknameEdit = true" />
      <van-cell title="邮箱" :value="auth.email || '未设置'" />
      <van-cell title="修改密码" is-link @click="showPasswordEdit = true" />
    </van-cell-group>

    <div style="padding: 32px 16px;">
      <van-button round block plain type="danger" @click="onLogout">退出登录</van-button>
    </div>

    <!-- 昵称编辑弹窗 -->
    <van-dialog
      v-model:show="showNicknameEdit"
      title="修改昵称"
      show-cancel-button
      @confirm="saveNickname"
    >
      <div style="padding: 16px;">
        <van-field v-model="newNickname" placeholder="请输入新昵称" />
      </div>
    </van-dialog>

    <!-- 密码编辑弹窗 -->
    <van-dialog
      v-model:show="showPasswordEdit"
      title="修改密码"
      show-cancel-button
      @confirm="savePassword"
    >
      <div style="padding: 16px;">
        <van-field v-model="passwordForm.oldPassword" type="password" label="原密码" placeholder="请输入原密码" />
        <van-field v-model="passwordForm.newPassword" type="password" label="新密码" placeholder="至少6个字符" />
        <van-field v-model="passwordForm.confirmPassword" type="password" label="确认密码" placeholder="再次输入新密码" />
      </div>
    </van-dialog>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 16px;
  background: linear-gradient(135deg, var(--keep-green-dark), var(--keep-green));
  border-radius: 0 0 16px 16px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-name {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
</style>
