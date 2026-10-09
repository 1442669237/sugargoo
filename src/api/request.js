import { i18n } from '@/locales'
import { env } from '@/config/env'
import { clearSession, getSession } from '@/utils/session'

export class RequestError extends Error {
  constructor(message, { code = 'UNKNOWN', statusCode = 0, cause } = {}) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.statusCode = statusCode
    this.cause = cause
  }
}

let onUnauthorized = () => {}
let lastToastAt = -Infinity

export function configureRequest(options = {}) {
  onUnauthorized = options.onUnauthorized || (() => {})
}

function notify(error, silent) {
  if (silent) return
  if (Date.now() - lastToastAt < 1500) return
  lastToastAt = Date.now()
  uni.showToast({ title: error.message, icon: 'none' })
}

function uniTransport(options) {
  return new Promise((resolve, reject) => {
    uni.request({ ...options, success: resolve, fail: reject })
  })
}

/** 后端约定：{ code: 0, message: '', data: T }。HTTP 401 或业务 code=401 表示会话失效。 */
export async function request({
  url,
  method = 'GET',
  data,
  header = {},
  auth = true,
  silent = false,
  timeout = env.timeout,
} = {}) {
  const session = auth ? getSession() : null
  try {
    // 业务接口只能使用配置的服务端，避免携带 token 请求外部地址。
    if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
      throw new RequestError('接口路径必须以单个 / 开头', { code: 'INVALID_URL' })
    }
    const response = await uniTransport({
      url: env.baseURL + url,
      method,
      data,
      timeout,
      header: {
        'Content-Type': 'application/json',
        ...header,
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
    })
    const body = response.data
    if (response.statusCode === 401 || body?.code === 401) {
      // 旧请求的迟到 401 不能清理用户刚刚重新登录的新会话。
      if (session && getSession()?.token === session.token) {
        clearSession()
        onUnauthorized()
      }
      throw new RequestError(i18n.global.t('errors.session'), {
        code: 'UNAUTHORIZED',
        statusCode: response.statusCode,
      })
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new RequestError(i18n.global.t('errors.http', { status: response.statusCode }), {
        code: 'HTTP_ERROR',
        statusCode: response.statusCode,
      })
    }
    if (!body || typeof body !== 'object' || !Object.prototype.hasOwnProperty.call(body, 'code')) {
      throw new RequestError(i18n.global.t('errors.response'), { code: 'INVALID_RESPONSE' })
    }
    if (body.code !== 0) {
      throw new RequestError(body.message || i18n.global.t('errors.failed'), {
        code: body.code,
        statusCode: response.statusCode,
      })
    }
    return body.data
  } catch (cause) {
    const error =
      cause instanceof RequestError
        ? cause
        : new RequestError(
            cause?.errMsg?.includes('timeout')
              ? i18n.global.t('errors.timeout')
              : i18n.global.t('errors.network'),
            {
              code: cause?.errMsg?.includes('timeout') ? 'TIMEOUT' : 'NETWORK_ERROR',
              cause,
            },
          )
    notify(error, silent)
    throw error
  }
}

export const http = {
  get: (url, data, options) => request({ ...options, url, data, method: 'GET' }),
  post: (url, data, options) => request({ ...options, url, data, method: 'POST' }),
  put: (url, data, options) => request({ ...options, url, data, method: 'PUT' }),
  delete: (url, data, options) => request({ ...options, url, data, method: 'DELETE' }),
}
