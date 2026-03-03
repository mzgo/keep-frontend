# keep-frontend

**脂付宝 (Keep)** 前端 H5 PWA 应用 —— 基于 Vue 3 + Vant 4 构建。

## 技术栈

- **构建**: [Vite](https://vite.dev/) 7
- **框架**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- **UI**: [Vant 4](https://vant-ui.github.io/vant/) (自动按需导入)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) + 持久化插件
- **路由**: Vue Router 5 (History 模式)
- **HTTP**: Axios (自动 Token 管理)
- **PWA**: vite-plugin-pwa (NetworkFirst 策略)
- **部署**: Cloudflare Pages

## 快速开始

### 前置条件

- Node.js >= 18
- 后端服务 [keep-server](https://github.com/mz/keep-server) 已启动

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
# 访问 http://localhost:5173
# API 请求自动代理到 http://localhost:8787
```

### 构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `/api`（开发环境通过 Vite proxy 转发） |

生产部署时，创建 `.env.production` 并设置后端 Worker 地址：

```
VITE_API_BASE_URL=https://keep-server.你的域名.workers.dev/api
```

## 项目结构

```
src/
├── main.ts               # 入口
├── App.vue               # 根组件
├── api/                   # API 层（Axios 客户端 + 各模块）
├── router/index.ts        # 路由定义与守卫
├── stores/auth.ts         # 认证状态（持久化）
├── styles/variables.css   # Vant 主题覆盖
├── utils/image.ts         # 图片压缩
└── views/
    ├── auth/              # 登录、注册
    ├── checker/           # 打卡者：首页、商城、历史、个人
    ├── manager/           # 管理者：概览、奖品、订单、个人、配置向导
    └── shared/            # 共享：积分明细、订单列表、个人信息组件
```

## 功能概览

### 打卡者

- 每日拍照打卡（客户端压缩后上传）
- 连续打卡周期进度、全勤奖励进度
- 积分余额与即将过期提醒
- 兑换商城（库存/积分状态区分）
- 订单管理（核销二维码、取消兑换）
- 打卡历史（日历视图 + 列表视图）

### 管理者

- 初始配置向导（打卡天数、积分规则）
- 奖品管理（CRUD、库存、盲盒）
- 邀请链接生成（一次性有效）
- 订单核销（扫码）
- 打卡者打卡记录监督

## 相关项目

- [keep-server](https://github.com/mz/keep-server) — 后端 API 服务（Cloudflare Workers）

## License

Private
