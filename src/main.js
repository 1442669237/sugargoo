import { createSSRApp } from 'vue'
import App from './App.vue'
import { i18n } from '@/locales'
import { usePreferencesStore } from '@/store/modules/preferences'
import { Pinia, setupStore } from '@/store'
import { useUserStore } from '@/store/modules/user'
import { configureRequest } from '@/api/request'

export function createApp() {
  const app = createSSRApp(App)
  setupStore(app)
  app.use(i18n)
  const preferences = usePreferencesStore()
  uni.setLocale(preferences.locale)
  const user = useUserStore()
  configureRequest({ onUnauthorized: () => user.syncSession() })
  return { app, Pinia }
}
