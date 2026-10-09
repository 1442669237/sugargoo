import {
  currencies,
  isCurrency,
  isLocale,
  defaultLocale,
  defaultCurrency,
} from '../shared/international.js'

export function resolvePreferences(searchParams) {
  const locale = searchParams.get('locale') || defaultLocale
  const currency = searchParams.get('currency') || defaultCurrency
  if (!isLocale(locale) || !isCurrency(currency))
    throw new RangeError('Unsupported locale or currency')
  return { locale, currency }
}

export function convertPrice(basePrice, currency, config) {
  const definition = currencies.find((item) => item.code === currency)
  const rate = config.rates[currency]
  if (
    !definition ||
    !/^\d+\.\d{6}$/.test(rate) ||
    config.base !== basePrice.currency ||
    !Number.isSafeInteger(basePrice.amountMinor) ||
    basePrice.amountMinor < 0 ||
    basePrice.fractionDigits !== 2
  ) {
    throw new Error('Invalid price or exchange rate')
  }
  const numerator =
    BigInt(basePrice.amountMinor) *
    BigInt(rate.replace('.', '')) *
    10n ** BigInt(definition.fractionDigits)
  const denominator = 100n * 1000000n
  const amountMinor = Number((numerator + denominator / 2n) / denominator)
  if (!Number.isSafeInteger(amountMinor)) throw new Error('Price out of range')
  return { currency, amountMinor, fractionDigits: definition.fractionDigits }
}
