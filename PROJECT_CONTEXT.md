# PROJECT_CONTEXT - keep-frontend

> 本文档供 AI 助手快速恢复项目上下文，非用户文档。

## 项目愿景

**脂付宝 (Keep)** —— 家庭运动激励工具。

H5 PWA 应用，联网优先（选择 PWA 仅为全屏体验和快速访问）。管理者配置打卡规则与奖品，打卡者每日拍照打卡、累积积分、兑换奖品。

中文名：脂付宝 | 英文名：Keep | 品牌色：绿 #2E7D32 / 金 #D4A843

## 核心业务逻辑

### 角色与入口

- 同一 H5 入口，通过 `userRole` 区分 manager / checker 界面
- manager：注册 → 配置规则 → 生成邀请链接 → 管理奖品/订单
- checker：通过邀请链接注册 → 每日打卡 → 累积积分 → 兑换奖品

### 打卡规则

- 连续打卡 `checkin_days`（默认 5）天 = 1 个周期，获得 `points_per_cycle`（默认 1）积分
- 连续完成 `bonus_cycles`（默认 3）个周期，额外获得 `bonus_points`（默认 1）积分
- 积分 `points_expiry_days`（默认 365）天后过期，兑换时 FIFO 消费
- 连续 `penalty_inactive_days`（默认 10）天不打卡，扣 `penalty_points`（默认 1）积分
- 逻辑日分界：`day_reset_hour`（默认凌晨 5 点），5 点前打卡算前一天
- 连续中断则周期进度和全勤进度全部归零

### 兑换流程

打卡者在商城兑换奖品 → 生成订单 + 核销码 → 管理者扫码核销
取消兑换 → 积分还原（已过期的积分会提示）→ 库存还原

## 技术栈

| 项 | 技术 |
|----|------|
| 构建 | Vite 7 |
| 框架 | Vue 3.5 (Composition API + `<script setup>`) |
| UI 库 | Vant 4（通过 unplugin-vue-components 自动按需导入） |
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| 路由 | Vue Router 5（History 模式） |
| HTTP | Axios（拦截器自动携带/刷新 Token） |
| PWA | vite-plugin-pwa（NetworkFirst 缓存策略） |
| 二维码 | qrcode 库 |
| 部署 | GitHub → Cloudflare Pages 自动部署 |

### 后端对接

- 后端仓库：`keep-server`（Cloudflare Workers + Hono）
- API 基础路径：`VITE_API_BASE_URL` 环境变量，默认 `/api`
- 开发环境 Vite proxy：`/api` → `http://localhost:8787`
- 生产环境需配置 `VITE_API_BASE_URL` 指向后端 Worker 域名

## 认证机制

- Access Token：JWT，15 分钟有效
- Refresh Token：90 天有效，刷新时轮换
- 客户端存储：Pinia persist → localStorage
- Axios 请求拦截器自动携带 `Authorization: Bearer <accessToken>`
- 401 响应 → 自动用 Refresh Token 续期，并发请求排队等待
- 续期失败 → 清除 auth 状态 → 跳转登录页

## 路由结构

```
/login                          # 登录页
/register                       # 注册页（管理者）
/register/:inviteCode           # 注册页（打卡者，携带邀请码）

/checker                        # CheckerLayout (Tabbar)
  /checker/                     # 首页：打卡状态、周期进度、打卡操作
  /checker/shop                 # 兑换商城
  /checker/history              # 打卡历史（日历/列表）
  /checker/profile              # 个人信息

/manager                        # ManagerLayout (Tabbar)
  /manager/                     # 管理概览：规则、打卡者、邀请
  /manager/prizes               # 奖品管理（CRUD）
  /manager/orders               # 订单管理（核销）
  /manager/profile              # 个人信息

/manager/setup                  # 管理者初始配置向导（独立页面）
/points-log                     # 积分明细（共享页面）
/orders                         # 订单列表（打卡者）

/                               # 重定向到 /login
/*                              # 重定向到 /
```

### 路由守卫逻辑

1. 需要认证 + 未登录 → 跳转 `/login?redirect=原路径`
2. 已登录 + 访问认证页面 → 跳转对应角色首页
3. 角色不匹配 → 跳转对应角色首页

## 目录结构

```
src/
├── main.ts                     # 入口：Pinia、Router、移除加载动画
├── App.vue                     # 根组件，仅 <router-view />
├── api/
│   ├── client.ts               # Axios 实例 + Token 拦截器/刷新
│   ├── auth.ts                 # 认证 API（登录/注册/验证码/个人信息）
│   ├── manager.ts              # 管理者 API（配置/邀请/打卡者列表）
│   ├── checkin.ts              # 打卡 API（打卡/状态/历史/日历）
│   ├── points.ts               # 积分 API（汇总/流水）
│   ├── prizes.ts               # 奖品 API（管理/商城/兑换）
│   └── orders.ts               # 订单 API（列表/取消/核销）
├── router/
│   └── index.ts                # 路由定义 + 守卫
├── stores/
│   └── auth.ts                 # 认证状态（持久化到 localStorage）
├── styles/
│   └── variables.css           # Vant4 主题覆盖 + 全局样式
├── utils/
│   └── image.ts                # Canvas API 图片压缩（maxWidth=1200, quality=0.7）
├── views/
│   ├── auth/
│   │   ├── LoginPage.vue       # 登录：用户名/密码/SVG验证码
│   │   └── RegisterPage.vue    # 注册：支持邀请码注册
│   ├── checker/
│   │   ├── CheckerLayout.vue   # 打卡者 Tabbar 布局
│   │   ├── HomePage.vue        # 首页：积分/连续天数/周期进度/打卡
│   │   ├── ShopPage.vue        # 兑换商城：奖品列表/兑换
│   │   ├── HistoryPage.vue     # 打卡历史：日历+列表视图
│   │   └── ProfilePage.vue     # 个人信息
│   ├── manager/
│   │   ├── ManagerLayout.vue   # 管理者 Tabbar 布局
│   │   ├── HomePage.vue        # 管理概览：规则/打卡者/邀请
│   │   ├── PrizesPage.vue      # 奖品管理：CRUD + 库存
│   │   ├── OrdersPage.vue      # 订单管理：核销
│   │   ├── ProfilePage.vue     # 个人信息
│   │   └── SetupWizard.vue     # 初始配置向导
│   └── shared/
│       ├── ProfileSection.vue  # 个人信息公共组件（头像上传等）
│       ├── PointsLogPage.vue   # 积分明细
│       └── OrdersPage.vue      # 打卡者订单列表
├── public/
│   └── logo.png                # 应用 Logo（512x512）
└── index.html                  # PWA meta + 品牌加载动画
```

## 核心数据流

### 打卡流程 (checker/HomePage.vue)

```
用户点击打卡按钮
  → Vant Uploader 唤起摄像头/相册
  → compressImage(file, 1200, 0.7)  // Canvas 压缩
  → 弹出确认框（预览图片 + 可选文字）
  → doCheckin(compressedFile, note)
    → POST /api/checkin (FormData: image + note)
  → 刷新打卡状态 getCheckinStatus()
  → UI 更新：连续天数、周期进度条、全勤进度
```

### 兑换流程 (checker/ShopPage.vue)

```
加载商城 getShopPrizes()
  → 显示奖品列表（标记 can_redeem / points_short / 无库存）
用户点击兑换
  → redeemPrize(prizeId)
    → POST /api/prizes/redeem/:id
  → 成功 → 跳转订单列表
```

### 核销流程 (manager/OrdersPage.vue)

```
管理者点击扫码核销
  → 唤起摄像头扫描打卡者订单二维码
  → verifyOrder(verifyCode)
    → POST /api/orders/verify
  → 订单状态 pending → verified
```

### Token 刷新流程 (api/client.ts)

```
任意 API 返回 401
  → 检查是否有 refreshToken
  → isRefreshing? → 排队等待
  → POST {baseUrl}/auth/refresh (用原生 axios，非 apiClient)
  → 成功 → setTokens() + 重放原请求 + 释放排队请求
  → 失败 → clearAuth() + 跳转 /login
```

## PWA 配置

- `registerType: 'autoUpdate'`：新 SW 自动激活
- `display: 'standalone'`：全屏体验
- `orientation: 'portrait'`：竖屏
- Workbox `runtimeCaching`：`/api/*` 使用 NetworkFirst（超时 10s，缓存 5min）
- 启动加载动画：纯 CSS 内联在 `index.html`，Vue 挂载后 fade-out 移除

## 主题与 UI

### 品牌色

| 变量 | 值 | 用途 |
|------|-----|------|
| `--keep-green` | #2E7D32 | 主色 |
| `--keep-green-light` | #4CAF50 | 辅助绿 |
| `--keep-green-dark` | #1B5E20 | 深绿（加载背景等） |
| `--keep-gold` | #D4A843 | 金色强调 |
| `--keep-gold-light` | #F0D78C | 浅金 |

### Vant 主题覆盖

- `--van-primary-color`: #2E7D32
- `--van-nav-bar-background`: #2E7D32（白色标题/图标）
- `--van-tabbar-item-active-color`: #2E7D32
- `--van-warning-color`: #D4A843

## 开发约定

### 环境变量

| 变量 | 说明 | 开发默认 |
|------|------|----------|
| `VITE_API_BASE_URL` | 后端 API 基础路径 | `/api`（Vite proxy 到 localhost:8787） |

### API 模块约定

- 每个 API 模块对应一个 `src/api/{module}.ts` 文件
- 统一使用 `apiClient`（`src/api/client.ts`）发请求
- 响应类型：`{ success: boolean; data?: T; error?: string }`
- Token 刷新使用原生 `axios` 而非 `apiClient`，避免循环拦截

### 组件约定

- 全部使用 `<script setup lang="ts">` + Composition API
- Vant 组件通过 `unplugin-vue-components` 自动按需导入，无需手动 import
- 页面级组件放 `views/`，按角色分目录
- 共享组件放 `views/shared/`

### 图片处理

- 打卡图片和头像上传前经过 Canvas 压缩
- 最大宽度 1200px，JPEG quality 0.7
- 压缩后通过 FormData 上传到后端（后端存 R2）

### TypeScript

- 严格模式：`strict: true`, `noUnusedLocals`, `noUnusedParameters`
- 路径别名：`@/` → `src/`
- Vant 组件类型：通过 `components.d.ts` 自动生成

## Roadmap

### 已完成 (v0.1)

- [x] 项目骨架：Vite + Vue3 + Vant4 + Pinia + PWA
- [x] 品牌加载动画（纯 CSS，零网络依赖）
- [x] 认证系统：登录/注册/Token 持久化/自动刷新
- [x] 管理者界面：配置向导、规则编辑、邀请链接、打卡者列表
- [x] 打卡者首页：打卡操作、周期进度、全勤进度、积分显示
- [x] 兑换商城：奖品列表、状态区分、兑换操作
- [x] 打卡历史：日历视图 + 列表视图
- [x] 订单管理：列表、取消（含积分过期提示）、核销二维码
- [x] 积分明细页面
- [x] 个人信息（头像上传、昵称修改、密码修改）

### 待开发

- [ ] PC 端超级管理员后台
- [ ] 补卡功能 UI
- [ ] 打卡照片扩展功能
- [ ] 错误边界与离线提示优化
- [ ] E2E 测试
