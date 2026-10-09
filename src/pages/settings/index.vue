<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBackPress, onShow } from '@dcloudio/uni-app'
import { useExchangeStore } from '@/store/modules/exchange'
import { usePreferencesStore } from '@/store/modules/preferences'
import { languages, currencies } from '../../../shared/international'
import { back } from '@/router'

const { t } = useI18n()
const preferences = usePreferencesStore()
const exchange = useExchangeStore()
const saving = ref(false)
const panel = ref('')
const draft = ref('')
const languageLabel = computed(
  () => languages.find((item) => item.code === preferences.locale)?.label,
)
const options = computed(() =>
  panel.value === 'language'
    ? languages
    : currencies.map((item) => ({ ...item, label: item.code })),
)
function openPanel(type) {
  if (saving.value) return
  draft.value = type === 'language' ? preferences.locale : preferences.currency
  panel.value = type
}
function closePanel() {
  if (!saving.value) panel.value = ''
}
function goBack() {
  if (panel.value) closePanel()
  else back()
}
async function confirm() {
  if (saving.value) return
  const type = panel.value
  const value = draft.value
  saving.value = true
  try {
    if (type === 'currency') await exchange.refresh(value, { force: true })
    preferences.save({ [type === 'language' ? 'locale' : 'currency']: value })
    panel.value = ''
    uni.setNavigationBarTitle({ title: t('settings.title') })
  } catch {
    uni.showToast({
      title: t(type === 'currency' ? 'exchange.failed' : 'settings.saveError'),
      icon: 'none',
    })
  } finally {
    saving.value = false
  }
}

onShow(() => uni.setNavigationBarTitle({ title: t('settings.title') }))
onBackPress(() => {
  if (panel.value) {
    closePanel()
    return true
  }
  return false
})
</script>
<template>
  <view class="settings-page">
    <view class="settings-header"
      ><button class="back-button" :aria-label="t('settings.back')" @click="goBack">←</button
      ><text>{{ t('settings.title') }}</text></view
    >
    <view class="settings-rows">
      <button class="settings-row" @click="openPanel('language')">
        <text>{{ t('settings.language') }}</text>
        <view class="row-value"
          ><text>{{ languageLabel }}</text
          ><text class="chevron">›</text></view
        >
      </button>
      <button class="settings-row" @click="openPanel('currency')">
        <text>{{ t('settings.currency') }}</text>
        <view class="row-value"
          ><text>{{ preferences.currency }}</text
          ><text class="chevron">›</text></view
        >
      </button>
    </view>
    <view v-if="panel" class="sheet-mask" @click="closePanel">
      <view
        class="sheet"
        :class="{ 'sheet--currency': panel === 'currency' }"
        role="dialog"
        :aria-label="t(`settings.${panel}`)"
        @click.stop
      >
        <view class="sheet-header"
          ><button class="sheet-back" :aria-label="t('settings.back')" @click="closePanel">‹</button
          ><text>{{ t(`settings.${panel}`) }}</text></view
        >
        <scroll-view class="sheet-options" scroll-y>
          <button
            v-for="option in options"
            :key="option.code"
            class="sheet-option"
            :disabled="saving"
            :class="{ selected: draft === option.code }"
            @click="draft = option.code"
          >
            <text>{{ option.label }}</text>
            <view class="radio" :class="{ checked: draft === option.code }"
              ><text v-if="draft === option.code">✓</text>
            </view>
          </button>
        </scroll-view>
        <view class="sheet-footer"
          ><button class="confirm-button" :disabled="saving" :loading="saving" @click="confirm">
            {{ t('settings.confirm') }}
          </button></view
        >
      </view>
    </view>
  </view>
</template>
<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  padding-top: var(--status-bar-height, 0px);
  background: #fff;
}

button::after {
  border: 0;
}

.settings-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 116rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.back-button {
  position: absolute;
  left: 28rpx;
  top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  width: 86rpx;
  height: 86rpx;
  padding: 0;
  border: 1rpx solid #e6e6e6;
  border-radius: 50%;
  background: linear-gradient(#f8f8f8, #fff);
  font-size: 42rpx;
  font-weight: 400;
  line-height: 1;
  color: #333;
}

.settings-rows {
  padding: 34rpx 28rpx 0;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  min-height: 86rpx;
  background: #fff;
  text-align: left;
  font-size: 28rpx;
  line-height: 1.5;
  border-radius: 0;
}

.settings-row + .settings-row {
  border-top: 1rpx solid #eee;
}

.row-value {
  display: flex;
  align-items: center;
  gap: 28rpx;
  color: #777;
}

.chevron {
  font-size: 42rpx;
  color: #aaa;
  font-weight: 300;
  line-height: 1;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  background: #0008;
  z-index: 20;
  display: flex;
  align-items: flex-end;
}

.sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 700rpx;
  max-height: calc(100vh - var(--status-bar-height, 0px) - 100rpx);
  border-radius: 30rpx 30rpx 0 0;
  background: #fff;
  overflow: hidden;
  padding: 0 28rpx;
}

.sheet--currency {
  height: calc(100vh - var(--status-bar-height, 0px) - 100rpx);
}

.sheet-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 84rpx;
  border-bottom: 1rpx solid #eee;
  font-size: 30rpx;
  font-weight: 600;
}

.sheet-back {
  position: absolute;
  left: 0;
  top: 0;
  width: 64rpx;
  height: 84rpx;
  padding: 0;
  margin: 0;
  background: transparent;
  color: #999;
  font-size: 54rpx;
  font-weight: 300;
  line-height: 76rpx;
  text-align: left;
}

.sheet-options {
  flex: 1;
  height: 0;
  min-height: 0;
  padding-top: 26rpx;
}

.sheet--currency .sheet-options {
  padding-top: 0;
}

.sheet-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0 30rpx 0 0;
  min-height: 88rpx;
  border-radius: 0;
  background: #fff;
  font-size: 34rpx;
  text-align: left;
  line-height: 1.5;
}

.sheet-option.selected {
  font-weight: 600;
}

.radio {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #d4d4d4;
  border-radius: 50%;
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
}

.radio.checked {
  background: #ff7900;
  border-color: #ff7900;
}

.sheet-footer {
  flex-shrink: 0;
  padding: 28rpx 0 max(48rpx, env(safe-area-inset-bottom));
}

.confirm-button {
  height: 76rpx;
  line-height: 76rpx;
  margin: 0;
  border-radius: 60rpx;
  background: #ff7900;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
