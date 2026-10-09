import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { i18n } from '@/locales'
import { defaultCurrency, isLocale, isCurrency } from '../../../shared/international'

export const usePreferencesStore = defineStore('preferences', () => {
  const saved = storage.get('preferences', {})
  const locale = ref(i18n.global.locale.value)
  const currency = ref(isCurrency(saved?.currency) ? saved.currency : defaultCurrency)

  function save(next) {
    const nextLocale = next.locale ?? locale.value
    const nextCurrency = next.currency ?? currency.value
    if (!isLocale(nextLocale) || !isCurrency(nextCurrency)) return
    // 先持久化；写入失败时不改变当前选择。
    storage.set('preferences', { locale: nextLocale, currency: nextCurrency })
    locale.value = nextLocale
    currency.value = nextCurrency
    i18n.global.locale.value = nextLocale
    uni.setLocale(nextLocale)
  }
  return { locale, currency, save }
})
