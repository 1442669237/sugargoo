<script setup>
import { useLocalization } from '@/hooks/useLocalization'
import { navigate } from '@/router'
const { t } = useLocalization('featured')

const promotions = [
  { image: 'new-arrivals', name: 'featured.new' },
  { image: 'hot-sellers', name: 'featured.hot' },
]
</script>
<template>
  <view class="tab-page featured-page"
    ><view class="page-header"
      ><text class="page-heading">{{ t('tabs.featured') }}</text
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
          <image class="ui-icon" src="/static/icons/language.svg" /></button></view></view
    ><view class="search-bar"
      ><image class="ui-icon" src="/static/icons/scan.svg" /><image
        class="ui-icon search-symbol"
        src="/static/icons/search.svg"
      /><text class="search-placeholder">{{ t('common.search') }}</text></view
    ><view class="featured-content"
      ><image class="outdoor-banner" src="/static/images/outdoor-banner.jpg" mode="widthFix" /><text
        class="promotion-title"
        >{{ t('featured.special') }}</text
      ><view class="promotion-grid"
        ><image
          v-for="item in promotions"
          :key="item.image"
          :src="`/static/images/${item.image}.jpg`"
          :alt="t(item.name)"
          mode="widthFix" /></view
      ><text class="promotion-title">{{ t('featured.shops') }}</text
      ><view class="shop-card"
        ><view class="shop-logo">S</view
        ><view
          ><text class="shop-name">{{ t('featured.name') }}</text
          ><text class="shop-detail">{{ t('featured.detail') }}</text></view
        ><text class="shop-tag">{{ t('featured.tag') }}</text></view
      ></view
    ></view
  >
</template>
<style scoped lang="scss">
@use '@/styles/tabs.scss';
.featured-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 95% -2%, #ff7187 0, #ff7187 180rpx, transparent 182rpx),
    radial-gradient(circle at -5% 38%, #ff7187 0, #ff7187 100rpx, transparent 102rpx),
    linear-gradient(#ff486c, #ff607b);
  padding-bottom: 36rpx;
}
.page-heading {
  color: #fff;
}
.header-actions .ui-icon {
  filter: brightness(0) invert(1);
}
.search-bar {
  margin-bottom: 40rpx;
}
.featured-content {
  padding: 0 28rpx;
}
.outdoor-banner {
  width: 100%;
  border-radius: 16rpx;
}
.promotion-title {
  display: block;
  text-align: center;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  margin: 48rpx 0 28rpx;
}
.promotion-grid {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}
.promotion-grid image {
  width: calc(50% - 5rpx);
  border-radius: 12rpx;
}
.shop-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 28rpx 20rpx;
  background: #fff;
  border: 14rpx solid #81c449;
  border-radius: 16rpx;
}
.shop-logo {
  width: 70rpx;
  height: 70rpx;
  background: #ff7900;
  color: #fff;
  border-radius: 16rpx;
  text-align: center;
  line-height: 70rpx;
  font-size: 44rpx;
  font-weight: 800;
}
.shop-name {
  display: block;
  font-weight: 600;
  font-size: 25rpx;
}
.shop-detail {
  display: block;
  color: #999;
  font-size: 19rpx;
  margin-top: 4rpx;
}
.shop-tag {
  margin-left: auto;
  font-size: 18rpx;
  color: #76b339;
  white-space: nowrap;
}
</style>
