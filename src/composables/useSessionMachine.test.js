import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useSessionMachine } from './useSessionMachine.js'
import { getActiveSession, setActiveSession, setPrefs } from '../lib/storage.js'

beforeEach(() => {
  localStorage.clear()
  setPrefs({ workDuration: 25, breakDuration: 5 })
})

describe('initial state', () => {
  it('starts in setup with no stored session', () => {
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('setup')
    expect(machine.sessionGoalText.value).toBe('')
  })
})

describe('starting a session', () => {
  it('moves setup -> active with a full work-duration timer', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    expect(machine.state.value).toBe('active')
    machine.tick(now)
    expect(machine.remainingMs.value).toBe(25 * 60 * 1000)
  })

  it('auto-transitions active -> blockEnd once the work duration elapses', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    expect(machine.state.value).toBe('blockEnd')
  })
})

describe('block end', () => {
  it('takeBreak moves blockEnd -> break with a break-duration timer, auto-ending to audit', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    expect(machine.state.value).toBe('break')
    machine.tick(now + 25 * 60 * 1000 + 5 * 60 * 1000)
    expect(machine.state.value).toBe('audit')
  })

  it('keepGoing moves blockEnd -> audit directly, without creating a break timer', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing()
    expect(machine.state.value).toBe('audit')
  })
})

describe('primer', () => {
  it('startPrimer moves setup -> primer, and showPrimerChoice is false until the countdown ends', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startPrimer(now)
    expect(machine.state.value).toBe('primer')
    machine.tick(now)
    expect(machine.showPrimerChoice.value).toBe(false)
  })

  it('showPrimerChoice becomes true once the 2-minute countdown elapses', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startPrimer(now)
    machine.tick(now + 2 * 60 * 1000)
    expect(machine.showPrimerChoice.value).toBe(true)
  })

  it('showPrimerChoice becomes true early when skipped, without waiting for the countdown', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startPrimer(now)
    machine.tick(now)
    machine.skipPrimerCountdown()
    expect(machine.showPrimerChoice.value).toBe(true)
  })

  it('commitFullSession moves primer -> active with a fresh full-length timer', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startPrimer(now)
    machine.commitFullSession(now + 2 * 60 * 1000)
    expect(machine.state.value).toBe('active')
    machine.tick(now + 2 * 60 * 1000)
    expect(machine.remainingMs.value).toBe(25 * 60 * 1000)
  })

  it('stopPrimer moves primer -> setup and leaves sessionGoalText untouched', () => {
    const machine = useSessionMachine()
    machine.sessionGoalText.value = '- [ ] draft outline'
    machine.startPrimer(1000)
    machine.stopPrimer()
    expect(machine.state.value).toBe('setup')
    expect(machine.sessionGoalText.value).toBe('- [ ] draft outline')
  })
})

describe('activeSession persistence', () => {
  it('persists state, sessionGoalText, and timer on transition', async () => {
    const machine = useSessionMachine()
    machine.sessionGoalText.value = '- [ ] draft outline'
    machine.startSession(1000)
    await nextTick()
    expect(getActiveSession()).toEqual({
      state: 'active',
      sessionGoalText: '- [ ] draft outline',
      timer: expect.objectContaining({ running: true }),
    })
  })

  it('clears activeSession when returning to setup', async () => {
    const machine = useSessionMachine()
    machine.startPrimer(1000)
    await nextTick()
    machine.stopPrimer()
    await nextTick()
    expect(getActiveSession()).toBeNull()
  })
})

describe('rehydration', () => {
  // startedAt values are relative to real Date.now() (not a small fake epoch)
  // because the composable runs one synchronous, real-time tick() at
  // construction to correct a stale reload — see next test.
  it('restores state and sessionGoalText from a stored activeSession', () => {
    const startedAt = Date.now() - 60 * 1000 // 1 minute into a 25-minute block
    setActiveSession({
      state: 'active',
      sessionGoalText: '- [ ] draft outline',
      timer: { durationMs: 25 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('active')
    expect(machine.sessionGoalText.value).toBe('- [ ] draft outline')
    machine.tick(startedAt + 60 * 1000)
    expect(machine.remainingMs.value).toBe(24 * 60 * 1000)
  })

  it('snaps to the correct downstream state if the timer already elapsed while unloaded', () => {
    const startedAt = Date.now() - 30 * 60 * 1000 // a 25-minute block that ended 5 minutes ago
    setActiveSession({
      state: 'active',
      sessionGoalText: '',
      timer: { durationMs: 25 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('blockEnd')
  })
})
