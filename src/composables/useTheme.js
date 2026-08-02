// useTheme.js — stamps the user's stored light/dark choice onto <html>, which is
// what resolves the light-dark() pairs in tokens.css.
import { watch } from 'vue'

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(prefs, updatePrefs) {
  // First run (or a hand-edited prefs blob): take the OS preference and persist
  // it. From then on the stored choice wins and the OS is no longer consulted.
  if (prefs.theme !== 'light' && prefs.theme !== 'dark') {
    updatePrefs({ theme: systemTheme() })
  }

  watch(
    () => prefs.theme,
    (theme) => {
      document.documentElement.dataset.theme = theme
    },
    { immediate: true },
  )
}
