<script setup>
const orders = [
  { icon: 'pay', label: '待付款' },
  { icon: 'purchase', label: '采购中/配货中' },
  { icon: 'warehouse', label: '已入库' },
  { icon: 'refund', label: '退款/售后' },
]
const tools = [
  { icon: 'operation', label: '操作中心' },
  { icon: 'package', label: '预演包裹' },
  { icon: 'resell', label: '我要转卖' },
]
const parcels = [
  { icon: 'parcel-pay', label: '待付款' },
  { icon: 'supplement', label: '待补款' },
  { icon: 'truck', label: '运输中' },
  { icon: 'pending', label: '待处理' },
]
const services = [
  { icon: 'favorite', label: '收藏夹' },
  { icon: 'frequent', label: '我的常购' },
  { icon: 'history', label: '浏览记录' },
  { icon: 'message', label: '客服中心', svg: true },
  { icon: 'help', label: '帮助中心' },
  { icon: 'guide', label: '新手指引' },
  { icon: 'gift', label: '转盘抽奖' },
  { icon: 'share', label: '分享有礼' },
]
</script>
<template>
  <view class="tab-page mine-page"
    ><view class="profile"
      ><view class="profile-top"
        ><view class="identity"
          ><view class="avatar"><image src="/static/images/avatar.png" /></view
          ><view><text class="user-name">齐晨熙</text><text class="vip">◆ VIP</text></view></view
        ><view class="header-actions"
          ><view class="message"
            ><image class="ui-icon" src="/static/icons/message.svg" /><text class="message__badge"
              >14</text
            ></view
          ><image class="ui-icon" src="/static/icons/settings.svg" /></view></view
      ><view class="balances"
        ><view><text class="balance-value">¥ 0.00</text><text>余额 (CNY)</text></view
        ><view><text class="balance-value">1</text><text>积分</text></view
        ><view><text class="balance-value">14</text><text>优惠券</text></view></view
      ></view
    ><view class="account-section"
      ><view class="section-heading"
        ><text>我的订单</text><text class="section-more">全部 ›</text></view
      ><view class="account-grid"
        ><view v-for="item in orders" :key="item.icon" class="account-item"
          ><image :src="`/static/icons/${item.icon}.png`" /><text>{{ item.label }}</text></view
        ></view
      ></view
    ><view class="account-section tools"
      ><view class="account-grid"
        ><view v-for="item in tools" :key="item.icon" class="account-item"
          ><image :src="`/static/icons/${item.icon}.png`" /><text>{{ item.label }}</text></view
        ></view
      ></view
    ><view class="account-section"
      ><view class="section-heading"
        ><text>我的包裹</text><text class="section-more">全部 ›</text></view
      ><view class="account-grid"
        ><view v-for="item in parcels" :key="item.icon" class="account-item"
          ><image :src="`/static/icons/${item.icon}.png`" /><text>{{ item.label }}</text></view
        ></view
      ></view
    ><view class="account-section promotions"
      ><image src="/static/images/flea.jpg" mode="widthFix" /><image
        src="/static/images/coupons.jpg"
        mode="widthFix" /></view
    ><view class="account-section more-services"
      ><view class="section-heading"><text>更多服务</text></view
      ><view class="account-grid"
        ><view v-for="item in services" :key="item.icon" class="account-item"
          ><image :src="`/static/icons/${item.icon}.${item.svg ? 'svg' : 'png'}`" /><text>{{
            item.label
          }}</text></view
        ></view
      ></view
    ><image class="support-mascot" src="/static/images/support.png" mode="aspectFit"
  /></view>
</template>
<style scoped lang="scss">
@use '@/styles/tabs.scss';
.mine-page {
  background: #f3f3f3;
  padding-bottom: 18rpx;
}
.profile {
  background: linear-gradient(115deg, #fff1df, #fff 65%);
  padding: 30rpx 28rpx 28rpx;
}
.profile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.identity {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: #fff;
}
.avatar image {
  width: 60rpx;
  height: 60rpx;
  opacity: 0.65;
}
.user-name {
  display: block;
  font-size: 31rpx;
  font-weight: 500;
}
.vip {
  display: inline-block;
  background: #302c39;
  color: #f6d1a9;
  padding: 0 14rpx;
  border-radius: 24rpx;
  font-size: 20rpx;
  line-height: 34rpx;
  margin-top: 6rpx;
}
.profile-top .header-actions {
  padding-top: 12rpx;
}
.balances {
  display: flex;
  justify-content: space-between;
  text-align: center;
  margin: 34rpx 36rpx 0;
  font-size: 24rpx;
}
.balances > view {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.balance-value {
  font-size: 29rpx;
}
.account-section {
  background: #fff;
  margin-top: 18rpx;
  padding: 22rpx 28rpx 36rpx;
  border-radius: 9rpx;
}
.account-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  row-gap: 28rpx;
}
.account-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12rpx;
  text-align: center;
  white-space: nowrap;
  font-size: 23rpx;
  color: #444;
}
.account-item image {
  width: 48rpx;
  height: 48rpx;
  object-fit: contain;
}
.tools {
  padding-top: 22rpx;
  padding-bottom: 28rpx;
  border-radius: 0;
}
.promotions {
  display: flex;
  gap: 16rpx;
  padding: 22rpx 28rpx;
}
.promotions image {
  width: calc(50% - 8rpx);
}
.more-services {
  padding-bottom: 28rpx;
}
.more-services .account-item {
  font-size: 23rpx;
}
.support-mascot {
  bottom: calc(var(--window-bottom, 0px) + 160rpx);
}
</style>
