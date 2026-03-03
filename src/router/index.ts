import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // 认证页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register/:inviteCode',
    name: 'RegisterWithInvite',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { requiresAuth: false },
  },

  // 打卡者页面
  {
    path: '/checker',
    component: () => import('@/views/checker/CheckerLayout.vue'),
    meta: { requiresAuth: true, role: 'checker' },
    children: [
      { path: '', name: 'CheckerHome', component: () => import('@/views/checker/HomePage.vue') },
      { path: 'shop', name: 'CheckerShop', component: () => import('@/views/checker/ShopPage.vue') },
      { path: 'history', name: 'CheckerHistory', component: () => import('@/views/checker/HistoryPage.vue') },
      { path: 'profile', name: 'CheckerProfile', component: () => import('@/views/checker/ProfilePage.vue') },
    ],
  },

  // 管理者页面
  {
    path: '/manager',
    component: () => import('@/views/manager/ManagerLayout.vue'),
    meta: { requiresAuth: true, role: 'manager' },
    children: [
      { path: '', name: 'ManagerHome', component: () => import('@/views/manager/HomePage.vue') },
      { path: 'prizes', name: 'ManagerPrizes', component: () => import('@/views/manager/PrizesPage.vue') },
      { path: 'orders', name: 'ManagerOrders', component: () => import('@/views/manager/OrdersPage.vue') },
      { path: 'profile', name: 'ManagerProfile', component: () => import('@/views/manager/ProfilePage.vue') },
    ],
  },

  // 管理者配置向导
  {
    path: '/manager/setup',
    name: 'ManagerSetup',
    component: () => import('@/views/manager/SetupWizard.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },

  // 积分明细（共享页面）
  {
    path: '/points-log',
    name: 'PointsLog',
    component: () => import('@/views/shared/PointsLogPage.vue'),
    meta: { requiresAuth: true },
  },

  // 订单列表（打卡者）
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/shared/OrdersPage.vue'),
    meta: { requiresAuth: true },
  },

  // 默认跳转
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (!to.meta.requiresAuth && auth.isLoggedIn) {
    const home = auth.userRole === 'manager' ? '/manager' : '/checker'
    return next(home)
  }

  if (to.meta.role && auth.userRole !== to.meta.role) {
    const home = auth.userRole === 'manager' ? '/manager' : '/checker'
    return next(home)
  }

  next()
})

export default router
