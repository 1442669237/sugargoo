import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { convertPrice, resolvePreferences } from './pricing.js'

const rates = JSON.parse(
  await readFile(new URL('./data/exchange-rates.json', import.meta.url), 'utf8'),
)
const base = { currency: 'AUD', amountMinor: 704, fractionDigits: 2 }

test('默认语言、币种与显式偏好互相独立', () => {
  assert.deepEqual(resolvePreferences(new URLSearchParams()), { locale: 'zh-CN', currency: 'AUD' })
  assert.deepEqual(resolvePreferences(new URLSearchParams('locale=es-ES&currency=JPY')), {
    locale: 'es-ES',
    currency: 'JPY',
  })
  assert.throws(() => resolvePreferences(new URLSearchParams('currency=BTC')), RangeError)
  assert.throws(() => resolvePreferences(new URLSearchParams('locale=unknown')), RangeError)
})

test('基准币种不变，换汇金额按目标币种小数位舍入', () => {
  assert.deepEqual(convertPrice(base, 'AUD', rates), {
    currency: 'AUD',
    amountMinor: 704,
    fractionDigits: 2,
  })
  assert.deepEqual(convertPrice(base, 'USD', rates), {
    currency: 'USD',
    amountMinor: 465,
    fractionDigits: 2,
  })
  assert.deepEqual(convertPrice(base, 'JPY', rates), {
    currency: 'JPY',
    amountMinor: 690,
    fractionDigits: 0,
  })
  assert.equal(convertPrice({ ...base, amountMinor: 1 }, 'GBP', rates).amountMinor, 1)
  assert.equal(convertPrice({ ...base, amountMinor: 0 }, 'KRW', rates).amountMinor, 0)
})

test('拒绝错误价格、缺失汇率和超出安全整数的结果', () => {
  assert.throws(() => convertPrice({ ...base, amountMinor: -1 }, 'USD', rates))
  assert.throws(() => convertPrice(base, 'USD', { ...rates, rates: {} }))
  assert.throws(() => convertPrice({ ...base, amountMinor: Number.MAX_SAFE_INTEGER }, 'KRW', rates))
})
