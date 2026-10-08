import pagesConfig from '@/pages.json'
import { settings } from '@/config/setting'

// 仅封装导航和参数编码。登录页、权限策略确定后再按需接入守卫。
export function navigate(path, query = {}, { replace = false } = {}) {
  const pages = [
    ...pagesConfig.pages.map((page) => `/${page.path}`),
    ...(pagesConfig.subPackages || []).flatMap((group) =>
      group.pages.map((page) => `/${group.root}/${page.path}`),
    ),
  ]
  if (!pages.includes(path)) return Promise.reject(new Error(`未注册的页面：${path}`))
  const isTab = pagesConfig.tabBar?.list.some((page) => `/${page.pagePath}` === path)
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  const url = isTab || !params ? path : `${path}?${params}`
  const method = isTab ? 'switchTab' : replace ? 'redirectTo' : 'navigateTo'
  return new Promise((resolve, reject) => uni[method]({ url, success: resolve, fail: reject }))
}

export function back() {
  if (getCurrentPages().length <= 1) return navigate(settings.homePath)
  return new Promise((resolve, reject) => uni.navigateBack({ success: resolve, fail: reject }))
}
