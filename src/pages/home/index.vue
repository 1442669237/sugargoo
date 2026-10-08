<script setup>
import { env } from '@/config/env'
</script>

<template>
  <view class="home">
    <text class="home__title">{{ env.title }}</text>
    <text class="home__description">项目已就绪，从这里开始开发。</text>
  </view>
</template>

<style scoped lang="scss">
.home {
  padding: 64rpx 32rpx;
}
.home__title {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
}
.home__description {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
}
</style>
