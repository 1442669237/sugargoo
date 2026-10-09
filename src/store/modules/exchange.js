import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getExchangeRate } from '@/api/modules/exchange'
import { storage } from '@/utils/storage'
import { isCurrency } from '../../../shared/international'
import { isQuote, isFresh, convertCnyPrice, RATE_MAX_AGE_MS } from '../../../shared/money'

export const useExchangeStore = defineStore('exchange', () => {
  const saved = storage.get('exchange-rates', {})
  const entries = ref(
    Object.fromEntries(
      Object.entries(saved || {}).filter(
        ([currency, entry]) =>
          isCurrency(currency) &&
          isQuote(entry?.quote, currency) &&
          Number.isFinite(entry.checkedAt),
      ),
    ),
  )
  const errors = ref({})
  const loading = ref({})
  const pending = new Map()
  const now = ref(Date.now())

  function refresh(currency, { force = false } = {}) {
    now.value = Date.now()
    if (pending.has(currency)) return pending.get(currency)
    if (!force && (currency === 'CNY' || isFresh(entries.value[currency], now.value))) {
      return Promise.resolve(entries.value[currency]?.quote)
    }
    loading.value = { ...loading.value, [currency]: true }
    const request = (async () => {
      try {
        const quote = await getExchangeRate(currency)
        if (!isQuote(quote, currency)) throw new Error('Invalid exchange rate')
        now.value = Date.now()
        entries.value = { ...entries.value, [currency]: { quote, checkedAt: now.value } }
        errors.value = { ...errors.value, [currency]: false }
        // 缓存失败不影响本次汇率使用。
        try {
          storage.set('exchange-rates', entries.value)
        } catch {
          /* storage unavailable */
        }
        return quote
      } catch (error) {
        errors.value = { ...errors.value, [currency]: true }
        throw error
      } finally {
        loading.value = { ...loading.value, [currency]: false }
        pending.delete(currency)
      }
    })()
    pending.set(currency, request)
    return request
  }
  function convert(price, currency) {
    const entry = entries.value[currency]
    if (
      currency !== 'CNY' &&
      (!entry || now.value < entry.checkedAt || now.value - entry.checkedAt > RATE_MAX_AGE_MS)
    )
      return null
    return convertCnyPrice(price, currency, entry?.quote)
  }
  return { entries, errors, loading, refresh, convert }
})
