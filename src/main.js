import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import './assets/styles/variables.css'
import './assets/styles/theme.css'
import './assets/styles/global.css'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.mount('#app')

// 移除首屏加载动画
const loading = document.getElementById('app-loading')
if (loading) {
  loading.classList.add('fade-out')
  setTimeout(() => loading.remove(), 400)
}
