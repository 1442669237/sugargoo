import { createSSRApp } from 'vue'
import App from './App.vue'
import { Pinia, setupStore } from '@/store'
import { useUserStore } from '@/store/modules/user'
import { configureRequest } from '@/api/request'

export function createApp() {
  const app = createSSRApp(App)
  setupStore(app)
  const user = useUserStore()
  configureRequest({ onUnauthorized: () => user.syncSession() })
  return { app, Pinia }
}
