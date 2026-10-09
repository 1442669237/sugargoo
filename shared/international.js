// 只包含跨前后端共享的支持列表，不包含汇率或价格计算。
export const languages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
]
export const currencies = [
  'CNY',
  'USD',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'CHF',
  'DKK',
  'HKD',
  'JPY',
  'KRW',
  'MOP',
  'MYR',
].map((code) => ({ code, fractionDigits: ['JPY', 'KRW'].includes(code) ? 0 : 2 }))
export const defaultLocale = 'zh-CN'
export const defaultCurrency = 'AUD'
export const isLocale = (value) => languages.some((item) => item.code === value)
export const isCurrency = (value) => currencies.some((item) => item.code === value)
