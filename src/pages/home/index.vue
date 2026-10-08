<script setup>
const shortcuts = ['新手教程', '定制采购', '运费估算', '推广联盟']
const statistics = [
  { value: '3.7', unit: '分', label: '用户好评' },
  { value: '85', unit: '个', label: '合作平台' },
  { value: '50', unit: '人', label: '专业买手' },
]
const steps = [
  { image: 'service-order', label: '提交代购订单', detail: '挑选心仪好物，轻松下单' },
  { image: 'service-warehouse', label: '签收验货入库', detail: '专业验货，安心寄存' },
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
        ><image class="ui-icon" src="/static/icons/language.svg" /></view
    ></view>
    <view class="search-bar"
      ><image class="ui-icon" src="/static/icons/scan.svg" /><image
        class="ui-icon search-symbol"
        src="/static/icons/search.svg"
      /><text class="search-placeholder">请输入商品链接</text></view
    >
    <view class="home-content">
      <image class="hero" src="/static/images/home-banner.jpg" mode="widthFix" />
      <view class="notice"
        ><image class="ui-icon" src="/static/icons/speaker.svg" /><text
          >【物流重要通知】欧盟取消 150 欧元以下包裹关税豁免政策</text
        ></view
      >
      <view class="shortcuts"
        ><view v-for="(item, index) in shortcuts" :key="item" class="shortcut"
          ><image :src="`/static/images/shortcut-${index}.png`" /><text>{{ item }}</text></view
        ></view
      >
      <view class="pagination"><view class="dot active" /><view class="dot" /></view>
      <view class="statistics"
        ><view v-for="item in statistics" :key="item.label" class="stat"
          ><text class="stat-value">{{ item.value }}</text
          ><text class="stat-unit">{{ item.unit }}</text
          ><text>{{ item.label }}</text></view
        ></view
      >
      <text class="service-title">一站式代购服务</text>
      <view class="service-steps"
        ><view v-for="(item, index) in steps" :key="item.image" class="service-step"
          ><image :src="`/static/images/${item.image}.jpg`" mode="widthFix" /><text
            class="step-title"
            >{{ index + 1 }}. {{ item.label }}</text
          ><text class="step-detail">{{ item.detail }}</text></view
        ></view
      >
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
</style>
