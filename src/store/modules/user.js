import { defineStore } from 'pinia'
import { getSession, saveSession, clearSession } from '@/utils/session'

// 不预设登录接口。实际登录成功后由业务调用 user.setSession(result)。
export const useUserStore = defineStore('user', {
  state: () => ({ session: getSession(), demoProfile: null }),
  getters: {
    profile: (state) => state.session?.user || state.demoProfile || null,
    isLoggedIn: (state) => Boolean(state.session?.token || state.demoProfile),
  },
  actions: {
    signInDemo(profile) {
      this.demoProfile = { nickname: profile.nickname }
    },
    setSession(session) {
      saveSession(session)
      this.demoProfile = null
      this.syncSession()
    },
    clearSession() {
      clearSession()
      this.session = null
      this.demoProfile = null
    },
    syncSession() {
      this.session = getSession()
    },
  },
})
