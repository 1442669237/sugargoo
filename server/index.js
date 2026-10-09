import { getExchangeRate } from './exchange-rates.js'
import { isLocale, isCurrency, defaultLocale } from '../shared/international.js'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 8080)
const dataFile = new URL('./data/products.json', import.meta.url)
const imageDirectory = new URL('./public/products/', import.meta.url)

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  try {
    const { pathname, searchParams } = new URL(request.url, 'http://localhost')
    // H5 开发通过 Vite 同源代理；App 原生请求不受浏览器 CORS 限制。
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD')
      return json(response, 405, { code: 405, message: '不支持的请求方法', data: null })
    }
    if (pathname === '/api/health') {
      return json(response, 200, { code: 0, message: 'ok', data: { status: 'ok' } })
    }
    if (pathname === '/api/products') {
      // 每次读取文件，修改服务端数据后无需重新编译前端或重启服务。
      const locale = searchParams.get('locale') || defaultLocale
      if (!isLocale(locale))
        return json(response, 400, { code: 400, message: '不支持的语言', data: null })
      const products = JSON.parse(await readFile(dataFile, 'utf8'))
      const items = products.map(({ titles, price, ...item }) => ({
        ...item,
        title: titles[locale] || titles['zh-CN'],
        price,
      }))
      response.setHeader('Cache-Control', 'no-store')
      return json(response, 200, {
        code: 0,
        message: 'ok',
        data: {
          items,
          total: items.length,
          locale,
        },
      })
    }
    if (pathname === '/api/exchange-rate') {
      const currency = searchParams.get('currency')
      if (!isCurrency(currency))
        return json(response, 400, { code: 400, message: '不支持的币种', data: null })
      response.setHeader('Cache-Control', 'no-store')
      try {
        return json(response, 200, {
          code: 0,
          message: 'ok',
          data: await getExchangeRate(currency),
        })
      } catch (error) {
        console.error('汇率获取失败:', error.message)
        return json(response, 502, { code: 502, message: '汇率暂时不可用', data: null })
      }
    }
    if (/^\/api\/images\/products\/[a-z0-9-]+\.jpg$/.test(pathname)) {
      const filename = pathname.split('/').pop()
      const image = await readFile(new URL(filename, imageDirectory))
      response.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache' })
      return response.end(request.method === 'HEAD' ? undefined : image)
    }
    return json(response, 404, { code: 404, message: '资源不存在', data: null })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return json(response, 404, { code: 404, message: '资源不存在', data: null })
    }
    console.error('请求处理失败:', error)
    return json(response, 500, { code: 500, message: '服务暂时不可用', data: null })
  }
})

server.on('error', (error) => {
  console.error(`后端启动失败: ${error.message}`)
  process.exitCode = 1
})
server.listen(port, host, () => {
  console.log(`本地 API: http://${host}:${port}/api/products`)
  console.log(`商品数据: ${fileURLToPath(dataFile)}`)
})
