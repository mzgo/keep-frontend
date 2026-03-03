import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vue(), Components({
    resolvers: [VantResolver()],
  }), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: '脂付宝',
      short_name: '脂付宝',
      description: '运动打卡，积分兑换',
      theme_color: '#2E7D32',
      background_color: '#1B5E20',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        {
          src: '/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      // 联网优先策略
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
            networkTimeoutSeconds: 10,
          },
        },
      ],
    },
  }), cloudflare()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})