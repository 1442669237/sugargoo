<script setup>
import { onUnmounted } from 'vue'
import { usePreferencesStore } from '@/store/modules/preferences'
import { useExchangeStore } from '@/store/modules/exchange'
import { onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const user = useUserStore()
const preferences = usePreferencesStore()
const exchange = useExchangeStore()
let timer
function checkRates() {
  exchange.refresh(preferences.currency).catch(() => {})
}
function stopTimer() {
  clearInterval(timer)
  timer = undefined
}
onShow(() => {
  user.syncSession()
  stopTimer()
  checkRates()
  timer = setInterval(checkRates, 60000)
})
onHide(stopTimer)
onUnmounted(stopTimer)
</script>

<style lang="scss">
@use '@/styles/reset.scss';
</style>
