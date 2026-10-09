<script setup>
import { useLocalization } from '@/hooks/useLocalization'
import { navigate } from '@/router'
import { ref, watch } from 'vue'
import { formatMoney } from '@/utils/money'
import { onLoad, onPullDownRefresh, onUnload } from '@dcloudio/uni-app'
import { getProducts } from '@/api/modules/products'

const { t, preferences } = useLocalization('home')

const products = ref([])
const loading = ref(false)
const loadError = ref(false)
let requestVersion = 0

async function loadProducts() {
  const version = ++requestVersion
  const selection = { locale: preferences.locale, currency: preferences.currency }
  loading.value = true
  loadError.value = false
  try {
    const items = await getProducts(selection)
    if (version === requestVersion) products.value = items
  } catch {
    if (version === requestVersion) loadError.value = true
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

onLoad(loadProducts)
watch(
  () => [preferences.locale, preferences.currency],
  () => {
    products.value = []
    loadProducts()
  },
)
onUnload(() => {
  requestVersion++
})
onPullDownRefresh(async () => {
  try {
    await loadProducts()
  } finally {
    uni.stopPullDownRefresh()
  }
})

const shortcuts = ['home.tutorial', 'home.custom', 'home.shipping', 'home.affiliate']
const statistics = [
  { value: '3.7', unit: 'home.scoreUnit', label: 'home.score' },
  { value: '85', unit: 'home.platformUnit', label: 'home.platforms' },
  { value: '50', unit: 'home.buyerUnit', label: 'home.buyers' },
]
const steps = [
  { image: 'service-order', label: 'home.order', detail: 'home.orderDetail' },
  { image: 'service-warehouse', label: 'home.warehouse', detail: 'home.warehouseDetail' },
]
</script>
<template>
  <view class="tab-page home-page">
    <view class="page-header"
      ><view class="brand"
        ><image class="brand-logo" src="/static/images/logo.png" /><text
          >SUGAR<text class="brand-orange">GOO</text></text
        ></view
      ><view class="header-actions"
        ><view class="message"
          ><image class="ui-icon" src="/static/icons/message.svg" /><text class="message__badge"
            >14</text
          ></view
        ><button
          class="settings-entry"
          :aria-label="t('settings.title')"
          @click="navigate('/pages/settings/index')"
        >
          <image class="ui-icon" src="/static/icons/language.svg" /></button></view
    ></view>
    <view class="search-bar"
      ><image class="ui-icon" src="/static/icons/scan.svg" /><image
        class="ui-icon search-symbol"
        src="/static/icons/search.svg"
      /><text class="search-placeholder">{{ t('common.search') }}</text></view
    >
    <view class="home-content">
      <image class="hero" src="/static/images/home-banner.jpg" mode="widthFix" />
      <view class="notice"
        ><image class="ui-icon" src="/static/icons/speaker.svg" /><text>{{
          t('home.notice')
        }}</text></view
      >
      <view class="shortcuts"
        ><view v-for="(item, index) in shortcuts" :key="item" class="shortcut"
          ><image :src="`/static/images/shortcut-${index}.png`" /><text>{{ t(item) }}</text></view
        ></view
      >
      <view class="pagination"><view class="dot active" /><view class="dot" /></view>
      <view class="statistics"
        ><view v-for="item in statistics" :key="item.label" class="stat"
          ><text class="stat-value">{{ item.value }}</text
          ><text class="stat-unit">{{ t(item.unit) }}</text
          ><text>{{ t(item.label) }}</text></view
        ></view
      >
      <text class="service-title">{{ t('home.service') }}</text>
      <view class="service-steps"
        ><view v-for="(item, index) in steps" :key="item.image" class="service-step"
          ><image :src="`/static/images/${item.image}.jpg`" mode="widthFix" /><text
            class="step-title"
            >{{ index + 1 }}. {{ t(item.label) }}</text
          ><text class="step-detail">{{ t(item.detail) }}</text></view
        ></view
      >
      <view class="product-section">
        <view class="product-heading"
          ><text>{{ t('products.heading') }}</text
          ><text class="product-subtitle">{{ t('products.subtitle') }}</text></view
        >
        <view class="product-divider"><view /></view>
        <view v-if="loading && !products.length" class="list-status">{{
          t('products.loading')
        }}</view>
        <view v-if="loadError" class="list-status">
          <text>{{ t('products.error') }}</text>
          <button class="retry-button" :disabled="loading" @click="loadProducts">
            {{ t('common.retry') }}
          </button>
        </view>
        <view v-else-if="!loading && !products.length" class="list-status">{{
          t('products.empty')
        }}</view>
        <view v-if="products.length" class="product-grid">
          <view v-for="product in products" :key="product.id" class="product-card">
            <image class="product-image" :src="product.image" mode="aspectFill" />
            <view class="product-info">
              <text class="product-title">{{ product.title }}</text>
              <view class="product-meta">
                <text class="product-price">{{
                  formatMoney(product.price, preferences.locale)
                }}</text>
                <text class="product-sales">{{
                  t('products.sales', { count: product.sales })
                }}</text>
              </view>
            </view>
          </view>
        </view>
        <text v-if="products.length && !loadError" class="list-end">{{
          t(loading ? 'products.refreshing' : 'products.end')
        }}</text>
      </view>
    </view>
    <image class="support-mascot" src="/static/images/support.png" mode="aspectFit" />
  </view>
</template>
<style scoped lang="scss">
@use '@/styles/tabs.scss';
.home-page {
  background: linear-gradient(180deg, #ffb578 0, #fff0e5 150rpx, #fff 270rpx);
  padding-bottom: 32rpx;
}
.brand {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: -1rpx;
}
.brand-logo {
  width: 60rpx;
  height: 64rpx;
}
.brand-orange {
  color: #ff7900;
}
.home-content {
  padding: 0 28rpx;
}
.hero {
  width: 100%;
  border-radius: 16rpx;
}
.notice {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 18rpx;
  padding: 22rpx 24rpx;
  background: #f5f5f5;
  border-radius: 14rpx;
  color: #777;
  font-size: 23rpx;
}
.notice .ui-icon {
  flex-shrink: 0;
}
.notice text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.shortcuts {
  display: flex;
  justify-content: space-around;
  margin-top: 24rpx;
}
.shortcut {
  width: 25%;
  text-align: center;
  padding: 0 4rpx;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10rpx;
  font-size: 23rpx;
  color: #111;
}
.shortcut image {
  width: 112rpx;
  height: 112rpx;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin: 62rpx 0 44rpx;
}
.dot {
  width: 19rpx;
  height: 9rpx;
  background: #eee;
  border-radius: 10rpx;
}
.dot.active {
  background: #ff7900;
}
.statistics {
  display: flex;
  gap: 30rpx;
  padding: 0 16rpx;
}
.stat {
  min-width: 0;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 20rpx 0 48rpx;
  border: 4rpx double #ffdbbc;
  border-radius: 12rpx;
  background: linear-gradient(#fff, #fff9f4);
  font-size: 21rpx;
  box-shadow: 0 12rpx 0 #fcfcfc;
}
.stat-value {
  font-size: 42rpx;
  line-height: 1.3;
  font-weight: 800;
  color: #ff7900;
}
.stat-unit {
  color: #ff7900;
  margin-bottom: 6rpx;
}
.service-title {
  display: block;
  text-align: center;
  color: #ff7900;
  font-size: 34rpx;
  font-weight: 700;
  margin: 44rpx 0;
}
.service-steps {
  display: flex;
  gap: 18rpx;
}
.service-step {
  flex: 1;
  min-width: 0;
}
.service-step image {
  width: 100%;
  border-radius: 12rpx;
}
.step-title {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
}
.step-detail {
  display: block;
  color: #999;
  font-size: 19rpx;
}

.product-section {
  margin-top: 44rpx;
}
.product-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 30rpx;
  font-weight: 600;
}
.product-subtitle {
  color: #999;
  font-size: 20rpx;
  font-weight: 400;
}
.product-divider {
  height: 4rpx;
  margin: 20rpx 0 26rpx;
  background: #eee;
}
.product-divider view {
  width: 17%;
  height: 100%;
  background: #ff7900;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28rpx 20rpx;
}
.product-card {
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border-radius: 6rpx;
  box-shadow: 0 8rpx 24rpx #00000006;
}
.product-image {
  width: 100%;
  height: calc((100vw - 76rpx) / 2);
  background: #f5f5f5;
}
.product-info {
  padding: 14rpx 14rpx 18rpx;
}
.product-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 72rpx;
  line-height: 36rpx;
  font-size: 24rpx;
}
.product-meta {
  flex-wrap: wrap;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6rpx;
  margin-top: 14rpx;
}
.product-price {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  color: #ff7900;
  font-size: 27rpx;
  font-weight: 800;
  white-space: nowrap;
}
.currency {
  font-size: 21rpx;
  font-weight: 400;
}
.product-sales {
  font-size: 20rpx;
  white-space: nowrap;
  color: #666;
}
.list-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 48rpx 0;
  color: #888;
  font-size: 24rpx;
}
.retry-button {
  margin: 0;
  font-size: 24rpx;
  line-height: 2.5;
  color: #ff7900;
  background: #fff5eb;
}
.retry-button::after {
  border: none;
}
.list-end {
  display: block;
  padding: 30rpx 0 8rpx;
  text-align: center;
  color: #aaa;
  font-size: 20rpx;
}
</style>
