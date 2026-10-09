import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRates } from './exchange-rates.js'
import { currencies } from '../shared/international.js'
import { convertCnyPrice, isFresh, RATE_CHECK_MS } from '../shared/money.js'

const price = { currency: 'CNY', amountMinor: 3309, fractionDigits: 2 }
const quote = (currency, rate) => ({
  base: 'CNY',
  currency,
  rateNumerator: Math.round(rate * 1e8),
  rateScale: 100000000,
  updatedAt: Date.now(),
})

test('人民币不换算，美元按分舍入，日元按整数舍入', () => {
  assert.deepEqual(convertCnyPrice(price, 'CNY'), price)
  assert.deepEqual(convertCnyPrice(price, 'USD', quote('USD', 0.148915)), {
    currency: 'USD',
    amountMinor: 493,
    fractionDigits: 2,
  })
  assert.deepEqual(convertCnyPrice(price, 'JPY', quote('JPY', 21)), {
    currency: 'JPY',
    amountMinor: 695,
    fractionDigits: 0,
  })
  assert.equal(
    convertCnyPrice({ ...price, amountMinor: 0 }, 'JPY', quote('JPY', 21)).amountMinor,
    0,
  )
  assert.equal(
    convertCnyPrice({ ...price, amountMinor: 1 }, 'USD', quote('USD', 0.5)).amountMinor,
    1,
  )
})

test('不能拿美元汇率计算日元，也不能将缺失汇率或非法金额显示成正常价格', () => {
  assert.equal(convertCnyPrice(price, 'JPY', quote('USD', 0.148915)), null)
  assert.equal(convertCnyPrice(price, 'USD', null), null)
  assert.equal(convertCnyPrice({ ...price, amountMinor: -1 }, 'USD', quote('USD', 0.148915)), null)
  assert.equal(convertCnyPrice({ ...price, currency: 'AUD' }, 'USD', quote('USD', 0.148915)), null)
})

test('五分钟和供应商下一次更新时间任一到期都需要更新，时钟倒退也不能误用缓存', () => {
  const start = 1000000
  const entry = { checkedAt: start, quote: { nextUpdateAt: start + RATE_CHECK_MS * 2 } }
  assert(isFresh(entry, start + RATE_CHECK_MS - 1))
  assert(!isFresh(entry, start + RATE_CHECK_MS))
  assert(!isFresh(entry, start - 1))
  assert(!isFresh({ ...entry, quote: { nextUpdateAt: start + 100 } }, start + 100))
})

test('供应商数据标准化并拒绝基准币种不一致或缺失币种', () => {
  const body = {
    result: 'success',
    base_code: 'CNY',
    time_last_update_unix: 10,
    time_next_update_unix: 100,
    rates: Object.fromEntries(
      currencies.map((item) => [item.code, item.code === 'CNY' ? 1 : 0.148915]),
    ),
  }
  const data = normalizeRates(body, 20000)
  assert.equal(data.rates.USD, 14891500)
  assert.equal(data.updatedAt, 10000)
  assert.throws(() => normalizeRates({ ...body, base_code: 'USD' }))
  assert.throws(() => normalizeRates({ ...body, rates: { CNY: 1 } }))
})

test('并发币种请求合并上游调用，缓存到期重取，失败不会伪造成功汇率', async () => {
  const originalFetch = globalThis.fetch
  const originalNow = Date.now
  let now = 100000
  let calls = 0
  let fail = false
  Date.now = () => now
  globalThis.fetch = async () => {
    calls++
    if (fail) throw new Error('provider offline')
    return new Response(
      JSON.stringify({
        result: 'success',
        base_code: 'CNY',
        time_last_update_unix: 90,
        time_next_update_unix: 110,
        rates: Object.fromEntries(
          currencies.map((item) => [item.code, item.code === 'CNY' ? 1 : 0.2]),
        ),
      }),
    )
  }
  try {
    const { getExchangeRate } = await import('./exchange-rates.js?cache-test')
    const [usd, jpy] = await Promise.all([getExchangeRate('USD'), getExchangeRate('JPY')])
    assert.equal(calls, 1)
    assert.equal(usd.currency, 'USD')
    assert.equal(jpy.currency, 'JPY')
    await getExchangeRate('EUR')
    assert.equal(calls, 1)
    now = 111000
    fail = true
    await assert.rejects(getExchangeRate('USD'), /offline/)
    assert.equal(calls, 2)
    const cny = await getExchangeRate('CNY')
    assert.equal(cny.rateNumerator, cny.rateScale)
    assert.equal(calls, 2)
  } finally {
    globalThis.fetch = originalFetch
    Date.now = originalNow
  }
})
