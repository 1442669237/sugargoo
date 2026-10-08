<script setup>
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const user = useUserStore()
onShow(() => user.syncSession())
</script>

<style lang="scss">
@use '@/styles/reset.scss';
</style>
