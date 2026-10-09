import { http } from '@/api/request'
import { env } from '@/config/env'

export async function getProducts(preferences) {
  const data = await http.get(
    '/products',
    { locale: preferences.locale },
    { auth: false, silent: true },
  )
  if (!data || !Array.isArray(data.items)) throw new Error('商品列表格式不正确')
  return data.items.map((item) => ({
    ...item,
    image: `${env.baseURL}${item.image}`,
  }))
}
