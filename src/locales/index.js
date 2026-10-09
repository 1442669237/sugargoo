import { createI18n } from 'vue-i18n'
import zh from './zh-CN.json'
import en from './en-US.json'
import es from './es-ES.json'
import { storage } from '@/utils/storage'
import { defaultLocale, isLocale } from '../../shared/international'

const saved = storage.get('preferences', {})
export const i18n = createI18n({
  legacy: false,
  locale: isLocale(saved?.locale) ? saved.locale : defaultLocale,
  fallbackLocale: defaultLocale,
  messages: { 'zh-CN': zh, 'en-US': en, 'es-ES': es },
})

export function syncTabLabels() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const names = ['home', 'featured', 'cart', 'mine']
  if (!names.some((name) => current?.route === `pages/${name}/index`)) return
  names.forEach((name, index) => {
    uni.setTabBarItem({ index, text: i18n.global.t(`tabs.${name}`) })
  })
}
