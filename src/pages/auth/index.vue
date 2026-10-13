<script setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onUnload } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const { t } = useI18n()
const user = useUserStore()
const mode = ref('login')
const visiblePassword = ref(false)
const agreed = ref(false)
const subscribed = ref(true)
const form = reactive({ nickname: '', email: '', password: '', captcha: '' })
const touched = reactive({ nickname: false, email: false, password: false, captcha: false })
const captchaCode = ref('')
const errors = computed(() => ({
  nickname:
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 20
      ? ''
      : t('auth.nicknameError'),
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : t('auth.emailError'),
  password: (mode.value === 'register'
    ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
    : /^.{6,20}$/
  ).test(form.password)
    ? ''
    : t('auth.passwordError'),
  captcha: form.captcha.trim().toUpperCase() === captchaCode.value ? '' : t('auth.captchaError'),
}))
const canSubmit = computed(
  () =>
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.captcha &&
    (mode.value === 'login' || (!errors.value.nickname && agreed.value)),
)
function refreshCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while (code === captchaCode.value)
  captchaCode.value = code
  form.captcha = ''
  touched.captcha = false
}
function switchMode(value) {
  mode.value = value
  visiblePassword.value = false
  uni.setNavigationBarTitle({ title: t(`auth.${value}`) })
  Object.keys(touched).forEach((key) => {
    touched[key] = false
  })
  refreshCaptcha()
}
function close() {
  uni.switchTab({ url: '/pages/mine/index' })
}
function submit() {
  if (!canSubmit.value) return
  // 只改变内存中的演示用户，不生成 Token，不持久化或提交密码。
  user.signInDemo({
    nickname: mode.value === 'register' ? form.nickname.trim() : form.email.trim().split('@')[0],
  })
  form.password = ''
  uni.showToast({
    title: t(mode.value === 'register' ? 'auth.registered' : 'auth.loggedIn'),
    icon: 'none',
  })
  close()
}
function showInfo(type) {
  uni.showModal({
    title: t(`auth.${type}`),
    content: t('auth.notConnected'),
    showCancel: false,
    confirmText: t('settings.confirm'),
  })
}
refreshCaptcha()
onShow(() => uni.setNavigationBarTitle({ title: t(`auth.${mode.value}`) }))
onUnload(() => {
  form.password = ''
  form.captcha = ''
})
</script>
<template>
  <view class="auth-page">
    <view class="auth-header"><text>SUGARGOOOO</text><button class="close" :aria-label="t('auth.close')"
        @click="close">×</button></view>
    <view class="auth-tabs"><button v-for="tab in ['login', 'register']" :key="tab" :class="{ active: mode === tab }"
        :aria-pressed="mode === tab" @click="switchMode(tab)">
        {{ t(`auth.${tab}`) }}
      </button></view>
    <view class="auth-body">
      <view v-if="mode === 'register'" class="field"><text class="field-label">{{ t('auth.nickname') }}</text>
        <view class="input-box"><input v-model="form.nickname" :aria-label="t('auth.nickname')"
            :placeholder="t('auth.nicknamePlaceholder')" maxlength="20" @blur="touched.nickname = true" /></view><text
          v-if="touched.nickname && errors.nickname" class="field-error">{{
            errors.nickname
          }}</text>
      </view>
      <view class="field"><text class="field-label">{{ t('auth.email') }}</text>
        <view class="input-box"><input v-model="form.email" :aria-label="t('auth.email')"
            :placeholder="t('auth.emailPlaceholder')" maxlength="100" type="text" @blur="touched.email = true" /></view>
        <text v-if="touched.email && errors.email" class="field-error">{{
          errors.email
          }}</text>
      </view>
      <view class="field"><text class="field-label">{{ t('auth.password') }}</text>
        <view class="input-box"><input v-model="form.password" :aria-label="t('auth.password')" :placeholder="mode === 'register'
            ? t('auth.passwordPlaceholder')
            : t('auth.loginPasswordPlaceholder')
          " :password="!visiblePassword" maxlength="20" @blur="touched.password = true" /><button class="eye"
            :aria-label="t(visiblePassword ? 'auth.hidePassword' : 'auth.showPassword')"
            @click="visiblePassword = !visiblePassword">
            <image :src="`/static/icons/${visiblePassword ? 'eye-open' : 'eye-closed'}.svg`" />
          </button></view><text v-if="touched.password && errors.password" class="field-error">{{
            errors.password
          }}</text>
      </view>
      <view class="field"><text class="field-label">{{ t('auth.captcha') }}</text>
        <view class="input-box"><input v-model="form.captcha" :aria-label="t('auth.captcha')"
            :placeholder="t('auth.captchaPlaceholder')" maxlength="4" @blur="touched.captcha = true" /><button
            class="captcha" :aria-label="t('auth.refreshCaptcha')" @click="refreshCaptcha">
            <text v-for="(char, index) in captchaCode" :key="index" :class="`captcha-char char-${index}`">{{ char
              }}</text>
          </button></view><text v-if="touched.captcha && errors.captcha" class="field-error">{{
            errors.captcha
          }}</text>
      </view>
      <button class="submit-button" :disabled="!canSubmit" @click="submit">
        {{ t(`auth.${mode}`) }}
      </button>
      <view v-if="mode === 'register'" class="agreements">
        <view class="agreement-row"><button class="check" :class="{ checked: agreed }" :aria-label="t('auth.agree')"
            :aria-pressed="agreed" @click="agreed = !agreed">
            {{ agreed ? '✓' : '' }}</button>
          <view>{{ t('auth.agreementPrefix')
          }}<text class="link" @click="showInfo('terms')">{{ t('auth.terms') }}</text>{{ t('auth.and')
            }}<text class="link" @click="showInfo('privacy')">{{ t('auth.privacy') }}</text></view>
        </view>
        <view class="agreement-row"><button class="check" :class="{ checked: subscribed }"
            :aria-label="t('auth.newsletter')" :aria-pressed="subscribed" @click="subscribed = !subscribed">
            {{ subscribed ? '✓' : '' }}</button><text>{{ t('auth.newsletter') }}</text></view>
      </view>
      <button v-else class="forgot" @click="showInfo('forgot')">{{ t('auth.forgot') }}</button>
      <text class="or">{{ t('auth.or') }}</text>
      <view class="social"><button aria-label="Google" @click="showInfo('google')">
          <image src="/static/icons/auth-google.png" />
        </button><button aria-label="Apple" @click="showInfo('apple')">
          <image src="/static/icons/auth-apple.png" />
        </button></view>
    </view>
  </view>
</template>
<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  padding-top: var(--status-bar-height, 0px);
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
  background: #fff;
}

button::after {
  border: 0;
}

.auth-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 112rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.close {
  position: absolute;
  right: 20rpx;
  width: 60rpx;
  height: 72rpx;
  padding: 0;
  margin: 0;
  line-height: 64rpx;
  font-size: 48rpx;
  font-weight: 300;
  background: transparent;
}

.auth-tabs {
  display: flex;
  border-bottom: 2rpx solid #ddd;
  margin: 0 16rpx;
}

.auth-tabs button {
  width: 50%;
  margin: 0;
  padding: 14rpx 0 20rpx;
  border-radius: 0;
  border-bottom: 8rpx solid transparent;
  background: #fff;
  font-size: 30rpx;
  line-height: 1.4;
}

.auth-tabs button.active {
  color: #ff7900;
  font-weight: 600;
  border-bottom-color: #ff7900;
}

.auth-body {
  padding: 26rpx 58rpx;
}

.field {
  position: relative;
  margin-bottom: 42rpx;
}

.field-label {
  display: block;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.input-box {
  display: flex;
  align-items: center;
  height: 76rpx;
  border: 2rpx solid #eee;
  border-radius: 7rpx;
  padding: 0 28rpx;
}

.input-box input {
  flex: 1;
  width: 0;
  min-width: 0;
  font-size: 23rpx;
  height: 100%;
  color: #333;
}

.input-box input::placeholder {
  color: #96a1aa;
}

.eye {
  flex-shrink: 0;
  background: transparent;
  margin: 0 0 0 12rpx;
  padding: 8rpx;
  line-height: 1;
}

.eye image {
  width: 34rpx;
  height: 28rpx;
}

.field-error {
  position: absolute;
  left: 0;
  top: 100%;
  color: #e34d4d;
  font-size: 19rpx;
  line-height: 1.4;
}

.captcha {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx;
  margin: 0 0 0 14rpx;
  width: 152rpx;
  height: 52rpx;
  background: #fff;
  border-radius: 0;
  line-height: 1;
}

.captcha::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 24rpx;
  height: 2rpx;
  background: #74a4ed;
  transform: rotate(-8deg);
}

.captcha-char {
  font-size: 31rpx;
  font-weight: 800;
  font-style: italic;
  z-index: 1;
  text-shadow: 1rpx 1rpx #fff;
}

.char-0 {
  color: #ba880d;
  transform: rotate(-16deg);
}

.char-1 {
  color: #0785dc;
  transform: rotate(12deg);
}

.char-2 {
  color: #183d68;
  transform: rotate(-10deg);
}

.char-3 {
  color: #3c9c97;
  transform: rotate(15deg);
}

.submit-button {
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 60rpx;
  margin: 6rpx 0 0;
  background: #ff7900;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.submit-button[disabled] {
  background: #e5e7e9;
  color: #9ca4ab;
}

.forgot {
  display: block;
  margin: 36rpx auto 0;
  padding: 0;
  width: fit-content;
  font-size: 25rpx;
  text-decoration: underline;
  background: transparent;
  color: #999;
  line-height: 1.5;
}

.agreements {
  margin-top: 40rpx;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-top: 18rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

.check {
  flex-shrink: 0;
  width: 30rpx;
  height: 30rpx;
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  margin: 4rpx 0 0;
  padding: 0;
  background: #fff;
  color: #fff;
  font-size: 22rpx;
  line-height: 26rpx;
}

.check.checked {
  background: #ff7900;
  border-color: #ff7900;
}

.link {
  color: #ff7900;
  font-weight: 600;
}

.or {
  display: block;
  text-align: center;
  margin: 62rpx 0 24rpx;
  font-size: 26rpx;
}

.social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.social button {
  background: transparent;
  margin: 0;
  padding: 0;
}

.social image {
  width: 44rpx;
  height: 44rpx;
}
</style>
