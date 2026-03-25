<template>
  <div class="page-container">
    <van-nav-bar title="管理中心" />
    <div class="content">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item icon="setting-o" text="规则配置" to="/manager/config" />
        <van-grid-item icon="gift-o" text="奖品管理" to="/manager/prizes" />
        <van-grid-item icon="friends-o" text="邀请打卡者" to="/manager/invite" />
        <van-grid-item icon="orders-o" text="订单管理" to="/manager/orders" />
        <van-grid-item icon="chart-trending-o" text="打卡监督" to="/manager/records" />
        <van-grid-item icon="user-o" text="个人信息" to="/profile" />
      </van-grid>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.content { padding: var(--spacing-md); }
</style>
