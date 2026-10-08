import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production' && !/^https:\/\//.test(env.VITE_API_BASE_URL || '')) {
    throw new Error('生产环境 VITE_API_BASE_URL 必须配置为 HTTPS 接口地址')
  }
  return {
    plugins: [uni.default ? uni.default() : uni()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    // 当前 uni 编译器仍使用 Sass legacy API；样式源码使用 @use。
    css: { preprocessorOptions: { scss: { silenceDeprecations: ['legacy-js-api'] } } },
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
    build: { sourcemap: false, minify: 'terser' },
  }
})
