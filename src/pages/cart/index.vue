<script setup>
function goShopping() {
  uni.switchTab({ url: '/pages/featured/index' })
}
</script>
<template>
  <view class="tab-page cart-page"
    ><view class="page-header"
      ><text class="page-heading">我的购物车 (0)</text
      ><view class="header-actions"
        ><image
          v-for="icon in ['search', 'heart', 'edit']"
          :key="icon"
          class="ui-icon"
          :src="`/static/icons/${icon}.svg`" /></view></view
    ><view class="empty-cart"
      ><view class="empty-illustration"
        ><view class="bubble bubble-one" /><view class="bubble bubble-two" /><view
          class="bubble bubble-three" /><view class="cart-circle"
          ><image src="/static/icons/cart.svg" /></view></view
      ><text class="empty-copy">购物车是空的 开始你的购物之旅吧～</text
      ><button class="shopping-button" @click="goShopping">前往商场</button></view
    ><view class="checkout"
      ><view class="checkout-summary"
        ><view class="selection"
          ><view class="checkbox" /><text>全选</text
          ><text>已选: <text class="orange">0</text></text></view
        ><view class="total"
          ><text>金额: </text><text class="total-value">AU$0.00</text></view
        ></view
      ><view class="checkout-actions"
        ><view class="estimate"
          ><text>预估</text><text class="estimate-caption">国际运费</text></view
        ><view class="confirm">确定</view></view
      ></view
    ></view
  >
</template>
<style scoped lang="scss">
@use '@/styles/tabs.scss';
.cart-page {
  background: #f7f7f7;
  padding-bottom: 220rpx;
}
.page-header {
  background: #fff;
}
.header-actions {
  gap: 30rpx;
}
.header-actions .ui-icon:first-child {
  filter: grayscale(1);
}
.empty-cart {
  text-align: center;
  padding: 130rpx 28rpx 40rpx;
}
.empty-illustration {
  position: relative;
  width: 380rpx;
  height: 220rpx;
  margin: 0 auto;
}
.cart-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 194rpx;
  height: 194rpx;
  border-radius: 50%;
  background: linear-gradient(#fffbc9, #fff);
  border-top: 2rpx solid #fff6ae;
  margin: 0 auto;
}
.cart-circle image {
  width: 132rpx;
  height: 132rpx;
}
.bubble {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(#eee, #fff);
}
.bubble-one {
  width: 42rpx;
  height: 42rpx;
  left: 6rpx;
  top: 42rpx;
  background: linear-gradient(#fffbc9, #fff);
}
.bubble-two {
  width: 52rpx;
  height: 52rpx;
  right: 26rpx;
  top: 20rpx;
}
.bubble-three {
  width: 24rpx;
  height: 24rpx;
  left: 60rpx;
  bottom: 32rpx;
}
.empty-copy {
  display: block;
  color: #555;
  font-size: 23rpx;
  margin-top: 38rpx;
}
.shopping-button {
  margin: 90rpx auto 0;
  width: 70%;
  height: 80rpx;
  border: 2rpx solid #ededed;
  border-radius: 50rpx;
  background: transparent;
  color: #333;
  font-size: 34rpx;
  line-height: 76rpx;
}
.shopping-button::after {
  border: 0;
}
.checkout {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--window-bottom, 0px);
  padding: 24rpx 28rpx;
  background: #fff;
  box-shadow: 0 -10rpx 24rpx #00000003;
  z-index: 3;
}
.checkout-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 23rpx;
}
.selection {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.checkbox {
  width: 34rpx;
  height: 34rpx;
  border: 2rpx solid #ccc;
  border-radius: 7rpx;
}
.orange,
.total-value {
  color: #ff7900;
  font-weight: 700;
}
.total {
  white-space: nowrap;
}
.total-value {
  font-size: 38rpx;
  font-weight: 800;
}
.checkout-actions {
  display: flex;
  gap: 20rpx;
  text-align: center;
  align-items: stretch;
}
.estimate {
  width: 35%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2rpx solid #d79c56;
  border-radius: 60rpx;
  color: #d49b55;
  background: #fff0dc;
  font-size: 27rpx;
  line-height: 1.2;
}
.estimate-caption {
  font-size: 19rpx;
  margin-top: 3rpx;
}
.confirm {
  flex: 1;
  border-radius: 60rpx;
  background: #ff7900;
  color: #fff;
  font-size: 30rpx;
  line-height: 80rpx;
  font-weight: 600;
}
</style>
