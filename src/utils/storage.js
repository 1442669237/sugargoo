import { settings } from '@/config/setting'

// 仅操作本项目命名空间；expiresAt 使用毫秒时间戳，0 表示不过期。
export const storage = {
  set(key, value, ttl = 0) {
    uni.setStorageSync(settings.storagePrefix + key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : 0,
    })
  },
  get(key, fallback = null) {
    try {
      const item = uni.getStorageSync(settings.storagePrefix + key)
      if (!item || typeof item !== 'object' || !Object.prototype.hasOwnProperty.call(item, 'value'))
        return fallback
      if (item.expiresAt && item.expiresAt <= Date.now()) {
        this.remove(key)
        return fallback
      }
      return item.value
    } catch {
      return fallback
    }
  },
  remove(key) {
    uni.removeStorageSync(settings.storagePrefix + key)
  },
  clear() {
    const { keys } = uni.getStorageInfoSync()
    keys.filter((key) => key.startsWith(settings.storagePrefix)).forEach(uni.removeStorageSync)
  },
}
