import { http } from '@/api/request'

export function getExchangeRate(currency) {
  return http.get('/exchange-rate', { currency }, { auth: false, silent: true, timeout: 10000 })
}
