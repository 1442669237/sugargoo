<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { back } from '@/router'
import { useLocalization } from '@/hooks/useLocalization'

const { t } = useLocalization('transit')
const tr = (key) => t(`transit.${key}`)
const packages = ref([createPackage(1)])
const agreed = ref(false)
let nextPackageId = 2

function createPackage(id) {
  return { id, trackingNumber: '', remark: '', goods: '', split: false, images: [] }
}

const addressFields = computed(() => [
  { key: 'recipient', label: 'recipient', value: tr('exampleAddress') },
  { key: 'postalCode', label: 'postalCode', value: '518000' },
  { key: 'contact', label: 'contact', value: '400-000-0000' },
  { key: 'address', label: 'address', value: tr('exampleLocation') },
])

onShow(() => {
  uni.setNavigationBarTitle({ title: t('tabs.transit') })
})

function goBack() {
  back().catch(() => uni.switchTab({ url: '/pages/home/index' }))
}

function copyAddress(value) {
  uni.setClipboardData({
    data: value,
    success: () => uni.showToast({ title: tr('copySuccess'), icon: 'success' }),
    fail: () => uni.showToast({ title: tr('copyFailed'), icon: 'none' }),
  })
}

function copyAllAddress() {
  const text = addressFields.value.map((field) => `${tr(field.label)}：${field.value}`).join('\n')
  copyAddress(text)
}

function addPackage() {
  packages.value.push(createPackage(nextPackageId++))
}

function removePackage(index) {
  if (packages.value.length === 1) return
  packages.value.splice(index, 1)
}

function chooseImages(parcel) {
  const remaining = 6 - parcel.images.length
  if (remaining <= 0) {
    uni.showToast({ title: tr('imageLimit'), icon: 'none' })
    return
  }
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (result) => parcel.images.push(...result.tempFilePaths),
  })
}

function removeImage(parcel, index) {
  parcel.images.splice(index, 1)
}

function showAgreement() {
  uni.showToast({ title: tr('agreementName'), icon: 'none' })
}

function submitParcels() {
  if (packages.value.some((parcel) => !parcel.trackingNumber.trim())) {
    uni.showToast({ title: tr('trackingRequired'), icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: tr('agreementRequired'), icon: 'none' })
    return
  }
  uni.showToast({ title: tr('submitSuccess'), icon: 'success' })
}
</script>

<template>
  <view class="tab-page transit-page">
    <view class="transit-hero">
      <image class="hero-background" src="/static/images/transit-hero.svg" mode="aspectFill" />
      <view class="hero-toolbar">
        <button class="back-button" :aria-label="t('settings.back')" @click="goBack">
          <text class="back-chevron">‹</text>
        </button>
      </view>
      <view class="hero-copy">
        <text class="hero-title">{{ tr('title') }}</text>
        <text class="hero-subtitle">{{ tr('subtitle') }}</text>
      </view>
    </view>

    <view class="transit-content">
      <view class="content-card address-card">
        <view class="card-heading">
          <view class="step-badge step-badge--orange">1</view>
          <view class="heading-copy">
            <text class="card-title">{{ tr('addressTitle') }}</text>
            <text class="card-description">{{ tr('addressDescription') }}</text>
          </view>
          <button class="copy-all" @click="copyAllAddress">
            <text class="copy-symbol">▣</text>{{ tr('copyAll') }}
          </button>
        </view>

        <view class="address-panel">
          <view class="address-pin"><text>⌖</text></view>
          <view class="address-details">
            <view v-for="field in addressFields" :key="field.key" class="address-row">
              <text class="address-label">{{ tr(field.label) }}</text>
              <text class="address-value">{{ field.value }}</text>
              <button
                class="copy-field"
                :aria-label="`${tr(field.label)} ${tr('copyAll')}`"
                @click="copyAddress(field.value)"
              >
                <text>▢</text>
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="content-card parcel-card">
        <view class="card-heading form-heading">
          <view class="step-badge step-badge--blue">2</view>
          <view class="heading-copy">
            <text class="card-title">{{ tr('trackingTitle') }}</text>
          </view>
        </view>

        <view v-for="(parcel, index) in packages" :key="parcel.id" class="parcel-form">
          <button
            v-if="packages.length > 1"
            class="remove-parcel"
            :aria-label="tr('removePackage')"
            @click="removePackage(index)"
          >
            ×
          </button>
          <view class="field-row">
            <image class="field-icon" src="/static/icons/truck.png" />
            <text class="field-label"
              >{{ tr('trackingNumber') }}<text class="required">*</text></text
            >
            <input
              v-model.trim="parcel.trackingNumber"
              class="field-input"
              maxlength="100"
              :placeholder="tr('trackingPlaceholder')"
              placeholder-class="field-placeholder"
            />
          </view>
          <view class="field-row">
            <image class="field-icon" src="/static/icons/edit.svg" />
            <text class="field-label">{{ tr('remark') }}</text>
            <input
              v-model="parcel.remark"
              class="field-input"
              maxlength="80"
              :placeholder="tr('remarkPlaceholder')"
              placeholder-class="field-placeholder"
            />
          </view>
          <view class="field-row">
            <image class="field-icon" src="/static/icons/package.png" />
            <text class="field-label">{{ tr('goods') }}</text>
            <input
              v-model="parcel.goods"
              class="field-input"
              maxlength="80"
              :placeholder="tr('goodsPlaceholder')"
              placeholder-class="field-placeholder"
            />
          </view>

          <view class="split-row" @click="parcel.split = !parcel.split">
            <view class="check-box" :class="{ checked: parcel.split }">
              <text v-if="parcel.split">✓</text>
            </view>
            <view class="split-copy">
              <text class="split-title">{{ tr('split') }}</text>
              <text class="split-description">{{ tr('splitDescription') }}</text>
            </view>
            <text class="help-mark">?</text>
          </view>

          <view class="upload-area">
            <view v-for="(image, imageIndex) in parcel.images" :key="image" class="image-thumb">
              <image :src="image" mode="aspectFill" />
              <button class="remove-image" @click.stop="removeImage(parcel, imageIndex)">×</button>
            </view>
            <button class="upload-tile" @click="chooseImages(parcel)">
              <text class="upload-plus">＋</text>
              <text class="upload-title">{{ tr('upload') }}</text>
              <text class="upload-hint">{{ tr('uploadLimit') }}</text>
            </button>
          </view>
        </view>

        <button class="add-package" @click="addPackage">
          <text class="add-symbol">＋</text>{{ tr('addPackage') }}
        </button>

        <view class="notice-box">
          <view class="notice-heading"
            ><text class="notice-mark">!</text>{{ tr('noticeTitle') }}</view
          >
          <text class="notice-copy">1. {{ tr('noticeFirst') }}</text>
          <text class="notice-copy">2. {{ tr('noticeSecond') }}</text>
        </view>

        <button class="submit-button" @click="submitParcels">{{ tr('submit') }}</button>
        <view class="agreement-row" @click="agreed = !agreed">
          <view class="check-box agreement-check" :class="{ checked: agreed }">
            <text v-if="agreed">✓</text>
          </view>
          <text>{{ tr('agreement') }}</text>
          <text class="agreement-link" @click.stop="showAgreement">{{ tr('agreementName') }}</text>
        </view>
      </view>

      <view class="guide-card guide-card--green">
        <view class="guide-number">3</view>
        <view class="guide-copy">
          <text class="guide-title">{{ tr('stepSubmit') }}</text>
          <text class="guide-description">{{ tr('stepSubmitDescription') }}</text>
        </view>
        <image class="guide-art" src="/static/icons/transit-parcel.svg" />
        <text class="guide-chevron">›</text>
      </view>
      <view class="guide-card guide-card--purple">
        <view class="guide-number">4</view>
        <view class="guide-copy">
          <text class="guide-title">{{ tr('stepPay') }}</text>
          <text class="guide-description">{{ tr('stepPayDescription') }}</text>
        </view>
        <image class="guide-art" src="/static/icons/transit-payment.svg" />
        <text class="guide-chevron">›</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use '@/styles/tabs.scss';

.transit-page {
  overflow: hidden;
  padding-bottom: 34rpx;
  background: linear-gradient(180deg, #edf4ff 0, #f5f8fc 470rpx, #f5f7fa 100%);
}

.transit-hero {
  position: relative;
  height: 360rpx;
  padding: 0 34rpx;
  background-color: #e9efff;
}

.hero-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-toolbar {
  position: relative;
  z-index: 1;
  padding-top: calc(var(--status-bar-height, 0px) + 10rpx);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66rpx;
  height: 66rpx;
  padding: 0;
  border: 1rpx solid #ffffffa8;
  border-radius: 50%;
  background: #ffffff88;
  color: #24354c;
}

.back-button::after,
.copy-all::after,
.copy-field::after,
.remove-parcel::after,
.upload-tile::after,
.remove-image::after,
.add-package::after,
.submit-button::after {
  border: 0;
}

.back-chevron {
  margin-top: -5rpx;
  font-size: 54rpx;
  line-height: 1;
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  margin-top: 22rpx;
  color: #1e2c42;
}

.hero-title {
  font-size: 42rpx;
  font-weight: 750;
  line-height: 1.25;
  letter-spacing: 1rpx;
}

.hero-subtitle {
  max-width: 500rpx;
  margin-top: 10rpx;
  color: #52647a;
  font-size: 23rpx;
  line-height: 1.45;
}

.transit-content {
  position: relative;
  z-index: 1;
  margin: -32rpx auto 0;
  padding: 0 22rpx;
}

.content-card {
  margin-bottom: 18rpx;
  padding: 26rpx 24rpx;
  border: 1rpx solid #ffffff;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 10rpx 32rpx #233c5a0d;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 22rpx;
}

.step-badge {
  display: flex;
  flex: 0 0 46rpx;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 25rpx;
  font-weight: 700;
  box-shadow: 0 5rpx 12rpx #00000017;
}

.step-badge--orange {
  background: linear-gradient(145deg, #ffbd69, #ef8a36);
}

.step-badge--blue {
  background: linear-gradient(145deg, #77adff, #467be6);
}

.heading-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.card-title {
  color: #273448;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 1.3;
}

.card-description {
  margin-top: 5rpx;
  color: #8a94a2;
  font-size: 19rpx;
  line-height: 1.4;
}

.copy-all {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8rpx;
  height: 48rpx;
  margin: 0;
  padding: 0 14rpx;
  border: 1rpx solid #dfe4e8;
  border-radius: 28rpx;
  background: #fff;
  color: #4c5867;
  font-size: 18rpx;
  line-height: 1;
}

.copy-symbol {
  color: #687789;
  font-size: 20rpx;
}

.address-panel {
  display: flex;
  gap: 20rpx;
  padding: 18rpx 14rpx;
  border: 1rpx solid #f4eadc;
  border-radius: 18rpx;
  background: linear-gradient(110deg, #fff8ee, #fffdf9 70%);
}

.address-pin {
  display: flex;
  flex: 0 0 58rpx;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  margin-top: 4rpx;
  border-radius: 50%;
  background: #f6a04d;
  color: #fff;
  font-size: 36rpx;
}

.address-details {
  flex: 1;
  min-width: 0;
}

.address-row {
  display: flex;
  align-items: flex-start;
  min-height: 42rpx;
  gap: 10rpx;
}

.address-label {
  flex: 0 0 100rpx;
  color: #7c828b;
  font-size: 20rpx;
  line-height: 1.45;
}

.address-value {
  flex: 1;
  min-width: 0;
  color: #303b4a;
  font-size: 20rpx;
  font-weight: 550;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.copy-field {
  flex: 0 0 30rpx;
  width: 30rpx;
  height: 34rpx;
  margin: -3rpx 0 0;
  padding: 0;
  background: transparent;
  color: #778392;
  font-size: 26rpx;
  line-height: 34rpx;
}

.parcel-card {
  padding-top: 24rpx;
}

.form-heading {
  margin-bottom: 18rpx;
}

.parcel-form {
  position: relative;
  padding-bottom: 18rpx;
  margin-bottom: 18rpx;
  border-bottom: 1rpx dashed #e8edf2;
}

.remove-parcel {
  position: absolute;
  z-index: 1;
  top: -14rpx;
  right: -6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38rpx;
  height: 38rpx;
  padding: 0;
  border-radius: 50%;
  background: #f1f3f6;
  color: #818b98;
  font-size: 30rpx;
  line-height: 1;
}

.field-row {
  display: flex;
  align-items: center;
  min-height: 68rpx;
  gap: 12rpx;
  margin-bottom: 10rpx;
  padding: 0 14rpx;
  border: 1rpx solid #e9edf2;
  border-radius: 12rpx;
  background: #fff;
}

.field-icon {
  flex: 0 0 30rpx;
  width: 30rpx;
  height: 30rpx;
  opacity: 0.78;
}

.field-label {
  flex: 0 0 118rpx;
  color: #465364;
  font-size: 20rpx;
  white-space: nowrap;
}

.required {
  margin-left: 5rpx;
  color: #ef6959;
}

.field-input {
  flex: 1;
  min-width: 0;
  height: 62rpx;
  color: #273448;
  font-size: 20rpx;
}

:deep(.field-placeholder) {
  color: #b1b8c2;
  font-size: 19rpx;
}

.split-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 7rpx 4rpx 14rpx;
}

.check-box {
  display: flex;
  flex: 0 0 29rpx;
  align-items: center;
  justify-content: center;
  width: 29rpx;
  height: 29rpx;
  margin-top: 2rpx;
  border: 2rpx solid #cbd1d8;
  border-radius: 6rpx;
  background: #fff;
  color: #fff;
  font-size: 21rpx;
  line-height: 1;
}

.check-box.checked {
  border-color: #ff9a43;
  background: #ff9a43;
}

.split-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.split-title {
  color: #455163;
  font-size: 21rpx;
  line-height: 1.35;
}

.split-description {
  margin-top: 4rpx;
  color: #a1a8b1;
  font-size: 17rpx;
  line-height: 1.35;
}

.help-mark {
  display: flex;
  flex: 0 0 25rpx;
  align-items: center;
  justify-content: center;
  width: 25rpx;
  height: 25rpx;
  margin-top: 2rpx;
  border: 1rpx solid #aab2bc;
  border-radius: 50%;
  color: #8e98a5;
  font-size: 17rpx;
  line-height: 1;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 2rpx;
}

.upload-tile,
.image-thumb {
  position: relative;
  display: flex;
  flex: 1 1 100%;
  min-width: 0;
  min-height: 118rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 0;
  padding: 12rpx;
  border: 2rpx dashed #dfe4e8;
  border-radius: 14rpx;
  background: #fbfcfd;
  color: #9ca5af;
  line-height: 1.3;
}

.upload-plus {
  color: #aeb7c0;
  font-size: 36rpx;
  line-height: 1;
}

.upload-title {
  margin-top: 4rpx;
  color: #7e8996;
  font-size: 19rpx;
}

.upload-hint {
  margin-top: 3rpx;
  color: #afb6bf;
  font-size: 16rpx;
}

.image-thumb {
  flex: 0 0 118rpx;
  width: 118rpx;
  min-width: 118rpx;
  height: 118rpx;
  min-height: 118rpx;
  padding: 0;
  border-style: solid;
  overflow: hidden;
}

.image-thumb image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 3rpx;
  right: 3rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  background: #1d2939b8;
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
}

.add-package {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 62rpx;
  margin: 3rpx 0 17rpx;
  padding: 0 16rpx;
  border: 2rpx dashed #f2c78f;
  border-radius: 13rpx;
  background: #fffaf2;
  color: #dc9447;
  font-size: 21rpx;
}

.add-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 27rpx;
  height: 27rpx;
  border-radius: 50%;
  background: #f5a24e;
  color: #fff;
  font-size: 21rpx;
  line-height: 1;
}

.notice-box {
  padding: 14rpx 16rpx;
  border-radius: 13rpx;
  background: linear-gradient(115deg, #fff5e8, #fffaf3);
  color: #817260;
}

.notice-heading {
  display: flex;
  align-items: center;
  gap: 9rpx;
  margin-bottom: 4rpx;
  color: #926f49;
  font-size: 20rpx;
  font-weight: 700;
}

.notice-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25rpx;
  height: 25rpx;
  border-radius: 50%;
  background: #edaa58;
  color: #fff;
  font-size: 17rpx;
}

.notice-copy {
  display: block;
  margin-top: 3rpx;
  padding-left: 34rpx;
  color: #8a7d6b;
  font-size: 17rpx;
  line-height: 1.4;
}

.submit-button {
  height: 64rpx;
  margin: 16rpx 0 11rpx;
  border-radius: 36rpx;
  background: linear-gradient(100deg, #ffbd57, #f47b35);
  box-shadow: 0 8rpx 18rpx #ee9b442b;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 64rpx;
}

.agreement-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6rpx;
  color: #9aa2ac;
  font-size: 17rpx;
  line-height: 1.5;
}

.agreement-check {
  flex-basis: 25rpx;
  width: 25rpx;
  height: 25rpx;
  font-size: 18rpx;
}

.agreement-link {
  color: #dc9551;
  text-decoration: underline;
}

.guide-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-height: 100rpx;
  margin-bottom: 14rpx;
  padding: 15rpx 18rpx;
  border: 1rpx solid #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx #233c5a0a;
}

.guide-card--green {
  background: linear-gradient(105deg, #f0fbf4, #fff 78%);
}

.guide-card--purple {
  background: linear-gradient(105deg, #f4f0ff, #fff 78%);
}

.guide-number {
  display: flex;
  flex: 0 0 40rpx;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #5ab87c;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.guide-card--purple .guide-number {
  background: #8668d8;
}

.guide-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.guide-title {
  color: #344052;
  font-size: 21rpx;
  font-weight: 700;
}

.guide-description {
  display: -webkit-box;
  margin-top: 4rpx;
  overflow: hidden;
  color: #929ba7;
  font-size: 16rpx;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.guide-art {
  flex: 0 0 65rpx;
  width: 65rpx;
  height: 60rpx;
}

.guide-chevron {
  color: #a5adb7;
  font-size: 38rpx;
}
</style>
