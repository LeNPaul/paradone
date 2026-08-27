import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, reactive, nextTick } from 'vue'
import { useSessionAlerts } from './useSessionAlerts.js'
import { playChime } from '../lib/chime.js'
import { showNotification } from '../lib/notify.js'

vi.mock('../lib/chime.js', () => ({ playChime: vi.fn() }))
vi.mock('../lib/notify.js', () => ({ showNotification: vi.fn() }))

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true })
}

// The state useSessionMachine hands over: a counter bumped only when a
// countdown runs out, and the flag saying which kind of block it was.
function machine({ afterBreak = false } = {}) {
  return { timerEnds: ref(0), afterBreak: ref(afterBreak) }
}

beforeEach(() => {
  vi.clearAllMocks()
  setHidden(true)
})

describe('the chime', () => {
  it('plays when a countdown runs out and sound is on', async () => {
    const { timerEnds, afterBreak } = machine()
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: true, notify: false }))

    timerEnds.value++
    await nextTick()

    expect(playChime).toHaveBeenCalledTimes(1)
  })

  it('stays silent when sound is off', async () => {
    const { timerEnds, afterBreak } = machine()
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: false, notify: false }))

    timerEnds.value++
    await nextTick()

    expect(playChime).not.toHaveBeenCalled()
  })

  it('plays again on the next block', async () => {
    const { timerEnds, afterBreak } = machine()
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: true, notify: false }))

    timerEnds.value++
    await nextTick()
    timerEnds.value++
    await nextTick()

    expect(playChime).toHaveBeenCalledTimes(2)
  })

  // useSessionMachine ticks once at construction to correct a rehydrated
  // session, so a tab reopened after its block expired must land on the
  // block-end screen without a bell going off at page load.
  it('does not fire for a countdown that ran out before it was wired up', async () => {
    const { timerEnds, afterBreak } = machine()
    timerEnds.value++

    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: true, notify: true }))
    await nextTick()

    expect(playChime).not.toHaveBeenCalled()
    expect(showNotification).not.toHaveBeenCalled()
  })
})

describe('the notification', () => {
  it('raises a Block complete popup when the tab is hidden', async () => {
    const { timerEnds, afterBreak } = machine()
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: false, notify: true }))

    timerEnds.value++
    await nextTick()

    expect(showNotification).toHaveBeenCalledWith(
      'Block complete',
      'Take a break, keep going, or wrap up?',
    )
  })

  it('says Break complete when the countdown that ran out was a break', async () => {
    const { timerEnds, afterBreak } = machine({ afterBreak: true })
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: false, notify: true }))

    timerEnds.value++
    await nextTick()

    expect(showNotification.mock.calls[0][0]).toBe('Break complete')
  })

  // On screen the block-end prompt has already said it; the popup exists to
  // reach a user who tabbed away.
  it('raises nothing while the tab is visible, but still chimes', async () => {
    setHidden(false)
    const { timerEnds, afterBreak } = machine()
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: true, notify: true }))

    timerEnds.value++
    await nextTick()

    expect(showNotification).not.toHaveBeenCalled()
    expect(playChime).toHaveBeenCalledTimes(1)
  })

  it('raises nothing when the popup is switched off', async () => {
    const { timerEnds, afterBreak } = machine()
    useSessionAlerts(timerEnds, afterBreak, reactive({ sound: true, notify: false }))

    timerEnds.value++
    await nextTick()

    expect(showNotification).not.toHaveBeenCalled()
  })
})
