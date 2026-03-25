<template>
  <div class="page-container">
    <van-nav-bar title="我的" />
    <div class="profile-header">
      <van-image round width="64" height="64" :src="auth.user?.avatarUrl || ''" fit="cover">
        <template #error><van-icon name="user-o" size="32" /></template>
      </van-image>
      <div class="profile-info">
        <h3>{{ auth.user?.nickname || auth.user?.username }}</h3>
        <p v-if="auth.user?.role === 'CHECKER'">管理者: {{ auth.user?.managerNickname || '--' }}</p>
      </div>
    </div>
    <van-cell-group inset style="margin-top: 16px">
      <van-cell title="编辑资料" is-link />
      <van-cell title="修改密码" is-link />
      <van-cell title="积分明细" is-link to="/points" />
      <van-cell title="绑定邮箱" is-link :value="auth.user?.email || '未绑定'" />
    </van-cell-group>
    <van-cell-group inset style="margin-top: 16px">
      <van-cell title="退出登录" is-link @click="handleLogout" />
    </van-cell-group>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-md);
  background: var(--color-bg-card);
}
.profile-info h3 { font-size: 18px; }
.profile-info p { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }
</style>
