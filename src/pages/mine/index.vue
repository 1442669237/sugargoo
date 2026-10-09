<script setup>
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { useLocalization } from '@/hooks/useLocalization'
import { navigate } from '@/router'
const { t } = useLocalization('mine')
const user = useUserStore()
let openingLogin = false
onShow(() => {
  openingLogin = false
  user.syncSession()
})
function handlePageTap() {
  if (user.isLoggedIn || openingLogin) return
  openingLogin = true
  navigate('/pages/auth/index').catch(() => {
    openingLogin = false
  })
}
function openSettings() {
  if (!user.isLoggedIn) handlePageTap()
  else navigate('/pages/settings/index')
}
function showFeature(label) {
  if (!user.isLoggedIn) {
    handlePageTap()
    return
  }
  uni.showToast({ title: t('auth.featurePending', { feature: t(label) }), icon: 'none' })
}
function signOut() {
  user.clearSession()
}

const orders = [
  { icon: 'pay', label: 'mine.pay' },
  { icon: 'purchase', label: 'mine.purchase' },
  { icon: 'warehouse', label: 'mine.warehouse' },
  { icon: 'refund', label: 'mine.refund' },
]
const tools = [
  { icon: 'operation', label: 'mine.operation' },
  { icon: 'package', label: 'mine.package' },
  { icon: 'resell', label: 'mine.resell' },
]
const parcels = [
  { icon: 'parcel-pay', label: 'mine.pay' },
  { icon: 'supplement', label: 'mine.supplement' },
  { icon: 'truck', label: 'mine.truck' },
  { icon: 'pending', label: 'mine.pending' },
]
const services = [
  { icon: 'favorite', label: 'mine.favorite' },
  { icon: 'frequent', label: 'mine.frequent' },
  { icon: 'history', label: 'mine.history' },
  { icon: 'message', label: 'mine.message', svg: true },
  { icon: 'help', label: 'mine.help' },
  { icon: 'guide', label: 'mine.guide' },
  { icon: 'gift', label: 'mine.gift' },
  { icon: 'share', label: 'mine.share' },
]
</script>
<template>
  <view class="tab-page mine-page" @click="handlePageTap"
    ><view class="profile"
      ><view class="profile-top"
        ><view class="identity"
          ><view class="avatar"><image src="/static/images/avatar.png" /></view
          ><view class="identity-copy"
            ><template v-if="user.isLoggedIn"
              ><text class="user-name">{{
                user.profile?.nickname || user.profile?.name || t('auth.member')
              }}</text
              ><text class="vip">◆ VIP</text></template
            ><template v-else
              ><text class="welcome">{{ t('auth.welcome') }}</text
              ><text class="login-prompt">{{ t('auth.loginRegister') }}</text></template
            ></view
          ></view
        ><view class="header-actions"
          ><view class="message"
            ><image class="ui-icon" src="/static/icons/message.svg" /><text
              v-if="user.isLoggedIn"
              class="message__badge"
              >14</text
            ></view
          ><button
            class="settings-entry"
            :aria-label="t('settings.title')"
            @click.stop="openSettings"
          >
            <image class="ui-icon" src="/static/icons/settings.svg" /></button></view></view
      ><view class="balances"
        ><view
          ><text class="balance-value">¥ 0.00</text><text>{{ t('mine.balance') }}</text></view
        ><view
          ><text class="balance-value">0</text><text>{{ t('mine.points') }}</text></view
        ><view
          ><text class="balance-value">0</text><text>{{ t('mine.coupons') }}</text></view
        ></view
      ></view
    ><view class="account-section"
      ><view class="section-heading"
        ><text>{{ t('mine.orders') }}</text
        ><text class="section-more" @click.stop="showFeature('mine.orders')"
          >{{ t('common.all') }} ›</text
        ></view
      ><view class="account-grid"
        ><view
          v-for="item in orders"
          :key="item.icon"
          class="account-item"
          @click.stop="showFeature(item.label)"
          ><image :src="`/static/icons/${item.icon}.png`" /><text>{{ t(item.label) }}</text></view
        ></view
      ></view
    ><view class="account-section tools"
      ><view class="account-grid"
        ><view
          v-for="item in tools"
          :key="item.icon"
          class="account-item"
          @click.stop="showFeature(item.label)"
          ><image :src="`/static/icons/${item.icon}.png`" /><text>{{ t(item.label) }}</text></view
        ></view
      ></view
    ><view class="account-section"
      ><view class="section-heading"
        ><text>{{ t('mine.parcels') }}</text
        ><text class="section-more" @click.stop="showFeature('mine.parcels')"
          >{{ t('common.all') }} ›</text
        ></view
      ><view class="account-grid"
        ><view
          v-for="item in parcels"
          :key="item.icon"
          class="account-item"
          @click.stop="showFeature(item.label)"
          ><image :src="`/static/icons/${item.icon}.png`" /><text>{{ t(item.label) }}</text></view
        ></view
      ></view
    ><view class="account-section promotions"
      ><image src="/static/images/flea.jpg" mode="widthFix" /><image
        src="/static/images/coupons.jpg"
        mode="widthFix" /></view
    ><view class="account-section more-services"
      ><view class="section-heading"
        ><text>{{ t('mine.services') }}</text></view
      ><view class="account-grid"
        ><view
          v-for="item in services"
          :key="item.icon"
          class="account-item"
          @click.stop="showFeature(item.label)"
          ><image :src="`/static/icons/${item.icon}.${item.svg ? 'svg' : 'png'}`" /><text>{{
            t(item.label)
          }}</text></view
        ></view
      ></view
    ><button v-if="user.isLoggedIn" class="logout-button" @click.stop="signOut">
      {{ t('auth.logout') }}</button
    ><image
      class="support-mascot"
      src="/static/images/support.png"
      mode="aspectFit"
      @click.stop="showFeature('mine.message')"
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
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.avatar {
  flex-shrink: 0;
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
  white-space: normal;
  line-height: 1.3;
  padding: 0 4rpx;
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
.identity-copy {
  min-width: 0;
}
.welcome {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
}
.login-prompt {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 8rpx;
}
.logout-button {
  margin: 18rpx 28rpx;
  font-size: 26rpx;
  background: #fff;
  color: #ff7900;
  border-radius: 10rpx;
}
.logout-button::after {
  border: 0;
}
</style>
