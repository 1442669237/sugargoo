import { currencies } from '../../shared/international'

export function formatMoney(price, locale = 'zh-CN') {
  if (!price || !Number.isSafeInteger(price.amountMinor)) return '—'
  const digits = price.fractionDigits
  if (!currencies.some((item) => item.code === price.currency && item.fractionDigits === digits))
    return '—'
  const value = price.amountMinor / 10 ** digits
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: price.currency,
      currencyDisplay: 'code',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  } catch {
    // 旧 App WebView 没有完整 Intl 时仍可正确展示币种和小数位。
    return `${price.currency} ${value.toFixed(digits)}`
  }
}
