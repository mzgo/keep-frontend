import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // -- 认证 --
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { guest: true }
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => import('@/views/auth/PasswordResetPage.vue'),
    meta: { guest: true }
  },

  // -- 打卡者 --
  {
    path: '/',
    name: 'CheckerHome',
    component: () => import('@/views/checker/HomePage.vue'),
    meta: { requiresAuth: true, role: 'CHECKER' }
  },
  {
    path: '/history',
    name: 'CheckinHistory',
    component: () => import('@/views/checker/CheckinHistoryPage.vue'),
    meta: { requiresAuth: true, role: 'CHECKER' }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/checker/ShopPage.vue'),
    meta: { requiresAuth: true, role: 'CHECKER' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/checker/OrderListPage.vue'),
    meta: { requiresAuth: true, role: 'CHECKER' }
  },
  {
    path: '/points',
    name: 'PointsLog',
    component: () => import('@/views/checker/PointsLogPage.vue'),
    meta: { requiresAuth: true, role: 'CHECKER' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/checker/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },

  // -- 管理者 --
  {
    path: '/manager',
    name: 'ManagerDashboard',
    component: () => import('@/views/manager/DashboardPage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  {
    path: '/manager/config',
    name: 'ManagerConfig',
    component: () => import('@/views/manager/ConfigPage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  {
    path: '/manager/prizes',
    name: 'ManagerPrizes',
    component: () => import('@/views/manager/PrizeManagePage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  {
    path: '/manager/orders',
    name: 'ManagerOrders',
    component: () => import('@/views/manager/OrderManagePage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  {
    path: '/manager/invite',
    name: 'ManagerInvite',
    component: () => import('@/views/manager/InvitePage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },
  {
    path: '/manager/records',
    name: 'ManagerCheckerRecords',
    component: () => import('@/views/manager/CheckerRecordsPage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  },

  // -- 邀请链接入口 --
  {
    path: '/invite/:token',
    name: 'InviteJoin',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { guest: true }
  },

  // -- 核销入口 --
  {
    path: '/verify/:orderId/:token',
    name: 'VerifyOrder',
    component: () => import('@/views/manager/VerifyOrderPage.vue'),
    meta: { requiresAuth: true, role: 'MANAGER' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.bootstrap()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isLoggedIn) {
    return auth.homeRoute
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return auth.homeRoute
  }
})

export default router
