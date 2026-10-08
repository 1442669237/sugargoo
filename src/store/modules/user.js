import { defineStore } from 'pinia'
import { getSession, saveSession, clearSession } from '@/utils/session'

// 不预设登录接口。实际登录成功后由业务调用 user.setSession(result)。
export const useUserStore = defineStore('user', {
  state: () => ({ session: getSession() }),
  getters: {
    profile: (state) => state.session?.user || null,
    isLoggedIn: (state) => Boolean(state.session?.token),
  },
  actions: {
    setSession(session) {
      saveSession(session)
      this.syncSession()
    },
    clearSession() {
      clearSession()
      this.session = null
    },
    syncSession() {
      this.session = getSession()
    },
  },
})
