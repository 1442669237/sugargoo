import { currencies } from '../shared/international.js'

// 后续只替换此适配器和配置，客户端继续使用 /api/exchange-rate。
const providerURL = process.env.EXCHANGE_RATE_URL || 'https://open.er-api.com/v6/latest/CNY'
const cacheMs = Number(process.env.EXCHANGE_RATE_CACHE_MS || 3600000)
let cached
let pending

export function normalizeRates(body, now = Date.now()) {
  if (
    body?.result !== 'success' ||
    body.base_code !== 'CNY' ||
    !body.rates ||
    !Number.isFinite(body.time_last_update_unix) ||
    !Number.isFinite(body.time_next_update_unix)
  ) {
    throw new Error('Invalid exchange rate response')
  }
  const rates = Object.fromEntries(
    currencies.map(({ code }) => {
      const rate = body.rates[code]
      if (!Number.isFinite(rate) || rate <= 0 || !Number.isSafeInteger(Math.round(rate * 1e8))) {
        throw new Error(`Invalid exchange rate: ${code}`)
      }
      return [code, Math.round(rate * 1e8)]
    }),
  )
  if (rates.CNY !== 100000000) throw new Error('Invalid base rate')
  return {
    rates,
    fetchedAt: now,
    updatedAt: body.time_last_update_unix * 1000,
    nextUpdateAt: body.time_next_update_unix * 1000,
    provider: 'ExchangeRate-API',
    sourceURL: 'https://www.exchangerate-api.com',
  }
}

export async function getExchangeRate(currency) {
  // CNY 不依赖第三方服务，但客户端切换仍请求此接口。
  if (currency === 'CNY')
    return {
      base: 'CNY',
      currency,
      rateNumerator: 100000000,
      rateScale: 100000000,
      updatedAt: Date.now(),
      provider: null,
    }
  const now = Date.now()
  if (!cached || now - cached.fetchedAt >= cacheMs || now >= cached.nextUpdateAt) {
    if (!pending) {
      pending = (async () => {
        const response = await fetch(providerURL, { signal: AbortSignal.timeout(8000) })
        if (!response.ok) throw new Error(`Rate provider HTTP ${response.status}`)
        cached = normalizeRates(await response.json())
        return cached
      })().finally(() => {
        pending = null
      })
    }
    await pending
  }
  return {
    base: 'CNY',
    currency,
    rateNumerator: cached.rates[currency],
    rateScale: 100000000,
    updatedAt: cached.updatedAt,
    nextUpdateAt: cached.nextUpdateAt,
    fetchedAt: cached.fetchedAt,
    provider: cached.provider,
    sourceURL: cached.sourceURL,
  }
}
