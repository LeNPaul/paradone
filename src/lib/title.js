// title.js — composes the browser tab title from session state, so time
// remaining is readable from the tab strip while working in another tab.
// DEFAULT_TITLE must match the static <title> in index.html.
import { formatMs } from './timer.js'

export const DEFAULT_TITLE = 'Paradone — Focus Timer'

const LABELS = { primer: 'Primer', active: 'Focus', break: 'Break' }

export function sessionTitle(state, remainingMs, isPaused) {
  const label = LABELS[state]
  if (!label) return DEFAULT_TITLE
  return `${isPaused ? '⏸' : '⏱'} ${formatMs(remainingMs)} ${label} — Paradone`
}
