import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa.svg'],
      manifest: {
        name: '보드게임 헬퍼',
        short_name: '보드헬퍼',
        description: '보드게임 플레이를 돕는 모바일 PWA 도구 모음',
        theme_color: '#07111f',
        background_color: '#07111f',
        display: 'standalone',
        orientation: 'any',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'pwa.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}']
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
