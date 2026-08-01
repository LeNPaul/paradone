// useDocumentTitle.js — mirrors the countdown into the browser tab title so
// time remaining is readable while the user is working in another tab.
import { computed, watch } from 'vue'
import { sessionTitle } from '../lib/title.js'

export function useDocumentTitle(state, remainingMs, isPaused) {
  // Watch the derived string, not remainingMs: the machine ticks 4x/second but
  // mm:ss only changes once a second.
  const title = computed(() => sessionTitle(state.value, remainingMs.value, isPaused.value))
  watch(
    title,
    (t) => {
      document.title = t
    },
    { immediate: true },
  )
}
