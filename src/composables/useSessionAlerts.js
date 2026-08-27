// useSessionAlerts.js — rings the bell when a countdown runs out. Hangs off the
// session machine the way useDocumentTitle does, which keeps the machine itself
// pure state transitions with no browser side-effects in it.
import { watch } from 'vue'
import { playChime } from '../lib/chime.js'
import { showNotification } from '../lib/notify.js'

export function useSessionAlerts(timerEnds, afterBreak, prefs) {
  // Not immediate, and that is load-bearing: useSessionMachine ticks once at
  // construction to correct a rehydrated session, so a tab reopened after its
  // block expired bumps the counter before this watcher exists — and lands on
  // the block-end screen without a bell going off at page load.
  watch(timerEnds, () => {
    if (prefs.sound) playChime()
    // The popup exists to reach a user who has tabbed away. On screen, the
    // block-end prompt has already said it.
    if (prefs.notify && document.hidden) {
      showNotification(
        afterBreak.value ? 'Break complete' : 'Block complete',
        'Take a break, keep going, or wrap up?',
      )
    }
  })
}
