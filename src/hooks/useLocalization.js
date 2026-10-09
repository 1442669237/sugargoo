import { useI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import { onShow, onReady } from '@dcloudio/uni-app'
import { syncTabLabels } from '@/locales'
import { usePreferencesStore } from '@/store/modules/preferences'

export function useLocalization(tabName) {
  const { t } = useI18n()
  const preferences = usePreferencesStore()
  async function sync() {
    await nextTick()
    const pages = getCurrentPages()
    if (pages[pages.length - 1]?.route !== `pages/${tabName}/index`) return
    syncTabLabels()
    uni.setNavigationBarTitle({ title: t(`tabs.${tabName}`) })
  }
  onShow(sync)
  onReady(sync)
  return { t, preferences }
}
