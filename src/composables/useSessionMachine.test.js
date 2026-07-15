import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useSessionMachine } from './useSessionMachine.js'
import { getActiveSession, setActiveSession, getPrefs, setPrefs, getSessions } from '../lib/storage.js'

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

  it('stopPrimer clears captures added during the aborted primer', () => {
    const machine = useSessionMachine()
    machine.startPrimer(1000)
    machine.addCapture('distracted by email', 1000)
    expect(machine.captures.value).toHaveLength(1)
    machine.stopPrimer()
    expect(machine.captures.value).toEqual([])
  })

  it('tracks usedPrimer: false for a direct session, true after committing from a primer', () => {
    const direct = useSessionMachine()
    direct.startSession(1000)
    expect(direct.usedPrimer.value).toBe(false)

    const viaPrimer = useSessionMachine()
    viaPrimer.startPrimer(1000)
    viaPrimer.commitFullSession(1000 + 2 * 60 * 1000)
    expect(viaPrimer.usedPrimer.value).toBe(true)
  })
})

describe('updatePrefs', () => {
  it('updates prefs reactively and persists the change', () => {
    const machine = useSessionMachine()
    machine.updatePrefs({ workDuration: 40, breakDuration: 0 })
    expect(machine.prefs.workDuration).toBe(40)
    expect(machine.prefs.breakDuration).toBe(0)
    expect(getPrefs()).toEqual({ workDuration: 40, breakDuration: 0 })
  })

  it('a session started after updating prefs uses the new work duration', () => {
    const machine = useSessionMachine()
    machine.updatePrefs({ workDuration: 40, breakDuration: 5 })
    const now = 1000
    machine.startSession(now)
    machine.tick(now)
    expect(machine.remainingMs.value).toBe(40 * 60 * 1000)
  })
})

describe('captures', () => {
  it('addCapture appends a timestamped entry', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.addCapture('reply to Mai re: weekend', now + 5000)
    expect(machine.captures.value).toEqual([
      { text: 'reply to Mai re: weekend', timestamp: new Date(now + 5000).toISOString() },
    ])
  })

  it('is a no-op for empty or whitespace-only text', () => {
    const machine = useSessionMachine()
    machine.startSession(1000)
    machine.addCapture('')
    machine.addCapture('   ')
    expect(machine.captures.value).toEqual([])
  })
})

describe('audit and summary', () => {
  it('submitAudit stores answers and moves to summary', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'got the outline done' })
    expect(machine.state.value).toBe('summary')
    expect(machine.auditProductive.value).toBe('focused')
    expect(machine.auditNotes.value).toBe('got the outline done')
  })

  it('startNewSession appends a session matching the data-model shape, then resets to setup', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.sessionGoalText.value = '- [ ] draft outline'
    machine.startSession(now)
    machine.addCapture('reply to Mai', now + 1000)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    machine.startNewSession()

    const sessions = getSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual({
      id: expect.any(String),
      date: new Date(now).toISOString(),
      sessionGoalText: '- [ ] draft outline',
      plannedDuration: 25,
      actualDuration: 25,
      captures: [{ text: 'reply to Mai', timestamp: new Date(now + 1000).toISOString() }],
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'done',
    })

    expect(machine.state.value).toBe('setup')
    expect(machine.sessionGoalText.value).toBe('')
    expect(machine.captures.value).toEqual([])
    expect(machine.auditProductive.value).toBe('')
    expect(machine.auditNotes.value).toBe('')
    expect(getActiveSession()).toBeNull()
  })

  it('records the work block\'s own start time and duration, not the break\'s, when a break was taken', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    machine.tick(now + 25 * 60 * 1000 + 5 * 60 * 1000)
    machine.submitAudit({ auditProductive: 'mixed', auditNotes: '' })
    machine.startNewSession()

    const sessions = getSessions()
    expect(sessions[0].date).toBe(new Date(now).toISOString())
    expect(sessions[0].plannedDuration).toBe(25)
    expect(sessions[0].actualDuration).toBe(25)
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
      captures: [],
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: 1000,
      primerSkipped: false,
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

  it('restores captures, usedPrimer, audit answers, and sessionStartedAt from a stored activeSession', () => {
    const sessionStartedAt = Date.now() - 60 * 1000
    setActiveSession({
      state: 'summary',
      sessionGoalText: '- [x] draft outline',
      timer: null,
      captures: [{ text: 'reply to Mai', timestamp: '2026-07-13T09:20:00Z' }],
      usedPrimer: true,
      auditProductive: 'mixed',
      auditNotes: 'tabbed out twice',
      sessionStartedAt,
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('summary')
    expect(machine.captures.value).toEqual([{ text: 'reply to Mai', timestamp: '2026-07-13T09:20:00Z' }])
    expect(machine.usedPrimer.value).toBe(true)
    expect(machine.auditProductive.value).toBe('mixed')
    expect(machine.auditNotes.value).toBe('tabbed out twice')
  })

  it('restores a skipped primer so the commit/stop choice survives a reload, instead of reverting to waiting out the countdown', () => {
    const startedAt = Date.now() - 30 * 1000 // 30s into the 2-minute primer, well before it finishes
    setActiveSession({
      state: 'primer',
      sessionGoalText: '',
      timer: { durationMs: 2 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
      primerSkipped: true,
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('primer')
    expect(machine.showPrimerChoice.value).toBe(true)
  })
})
