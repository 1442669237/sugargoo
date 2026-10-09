import { currencies } from './international.js'

export const RATE_CHECK_MS = 5 * 60 * 1000
export const RATE_MAX_AGE_MS = 24 * 60 * 60 * 1000
export function isQuote(quote, currency) {
  return (
    quote?.base === 'CNY' &&
    quote.currency === currency &&
    Number.isSafeInteger(quote.rateNumerator) &&
    quote.rateNumerator > 0 &&
    quote.rateScale === 100000000 &&
    Number.isFinite(quote.updatedAt) &&
    quote.updatedAt > 0
  )
}
export function isFresh(entry, now = Date.now()) {
  return (
    entry &&
    now >= entry.checkedAt &&
    now - entry.checkedAt < RATE_CHECK_MS &&
    (!entry.quote.nextUpdateAt || now < entry.quote.nextUpdateAt)
  )
}

function gcd(a, b) {
  while (b) {
    const rest = a % b
    a = b
    b = rest
  }
  return a
}

// 整数有理数换算；约分后计算，避免浮点金额和旧 WebView 的 BigInt 兼容问题。
export function convertCnyPrice(price, currency, quote) {
  const definition = currencies.find((item) => item.code === currency)
  if (
    !definition ||
    price?.currency !== 'CNY' ||
    price.fractionDigits !== 2 ||
    !Number.isSafeInteger(price.amountMinor) ||
    price.amountMinor < 0
  )
    return null
  if (currency === 'CNY') return price
  if (!isQuote(quote, currency)) return null
  let denominator = 100 * quote.rateScale
  const factors = [price.amountMinor, quote.rateNumerator, 10 ** definition.fractionDigits]
  for (let i = 0; i < factors.length; i++) {
    const divisor = gcd(factors[i], denominator)
    factors[i] /= divisor
    denominator /= divisor
  }
  let numerator = 1
  for (const factor of factors) {
    numerator *= factor
    if (!Number.isSafeInteger(numerator)) return null
  }
  const amountMinor =
    Math.floor(numerator / denominator) +
    (numerator % denominator >= Math.ceil(denominator / 2) ? 1 : 0)
  if (!Number.isSafeInteger(amountMinor)) return null
  return { currency, amountMinor, fractionDigits: definition.fractionDigits }
}
