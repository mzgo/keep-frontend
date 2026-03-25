import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // 联网优先策略，不做离线缓存
        runtimeCaching: [],
        navigateFallback: null
      },
      manifest: {
        name: 'Keep 运动打卡',
        short_name: 'Keep',
        description: '运动打卡激励应用',
        theme_color: '#1B7D3E',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/logo.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icons/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-vant': ['vant']
        }
      }
    }
  }
})
