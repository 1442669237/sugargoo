import { storage } from '@/utils/storage'

const SESSION_KEY = 'session'

export function getSession() {
  const session = storage.get(SESSION_KEY)
  if (!session || typeof session.token !== 'string' || !session.token) return null
  if (!Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) return null
  return session
}

export function saveSession(session) {
  if (
    typeof session?.token !== 'string' ||
    !session.token ||
    !Number.isFinite(session.expiresAt) ||
    session.expiresAt <= Date.now()
  ) {
    throw new Error('登录响应缺少有效的 token / expiresAt')
  }
  storage.set(SESSION_KEY, session, session.expiresAt - Date.now())
}

export function clearSession() {
  storage.remove(SESSION_KEY)
}
