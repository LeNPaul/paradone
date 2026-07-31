import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useSessionMachine } from './useSessionMachine.js'
import { getActiveSession, setActiveSession, getPrefs, setPrefs, getSessions, setGoalsList } from '../lib/storage.js'

beforeEach(() => {
  localStorage.clear()
  setPrefs({ workDuration: 25, breakDuration: 5 })
})

describe('initial state', () => {
  it('starts in setup with no stored session', () => {
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('setup')
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

describe('pausing and stopping an active session', () => {
  it('pauseSession freezes remainingMs, resumeSession continues counting down from there', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 60 * 1000) // 1 minute in
    machine.pauseSession(now + 60 * 1000)
    expect(machine.isPaused.value).toBe(true)

    machine.tick(now + 5 * 60 * 1000) // time passes while paused
    expect(machine.remainingMs.value).toBe(24 * 60 * 1000)

    machine.resumeSession(now + 5 * 60 * 1000)
    expect(machine.isPaused.value).toBe(false)
    machine.tick(now + 6 * 60 * 1000) // 1 more minute after resuming
    expect(machine.remainingMs.value).toBe(23 * 60 * 1000)
  })

  it('stopSession moves active -> audit directly, preserving the capture text', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.capture.value = 'distracted by email'
    machine.stopSession(now + 5 * 60 * 1000)
    expect(machine.state.value).toBe('audit')
    expect(machine.capture.value).toBe('distracted by email')
  })

  it('a stopped-early session is logged as not completed, with actualDuration less than plannedDuration', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.stopSession(now + 5 * 60 * 1000)
    machine.submitAudit({ auditProductive: 'distracted', auditNotes: '' })
    machine.startNewSession()

    const sessions = getSessions()
    expect(sessions[0].completed).toBe(false)
    expect(sessions[0].plannedDuration).toBe(25)
    expect(sessions[0].actualDuration).toBe(5)
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

  it('stopPrimer moves primer -> setup', () => {
    const machine = useSessionMachine()
    machine.startPrimer(1000)
    machine.stopPrimer()
    expect(machine.state.value).toBe('setup')
  })

  it('stopPrimer clears the capture written during the aborted primer', () => {
    const machine = useSessionMachine()
    machine.startPrimer(1000)
    machine.capture.value = 'distracted by email'
    machine.stopPrimer()
    expect(machine.capture.value).toBe('')
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

describe('capture', () => {
  it('starts empty and holds the freeform text written during a session', () => {
    const machine = useSessionMachine()
    machine.startSession(1000)
    expect(machine.capture.value).toBe('')
    machine.capture.value = 'reply to Mai re: weekend\ncheck the deploy logs'
    expect(machine.capture.value).toBe('reply to Mai re: weekend\ncheck the deploy logs')
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

  it('skipAudit moves to summary without recording any audit answers', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.stopSession(now + 5 * 60 * 1000)
    expect(machine.state.value).toBe('audit')
    machine.skipAudit()
    expect(machine.state.value).toBe('summary')
    expect(machine.auditProductive.value).toBe('')
    expect(machine.auditNotes.value).toBe('')
  })

  it('a skipped audit is logged with empty audit fields', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.stopSession(now + 5 * 60 * 1000)
    machine.skipAudit()
    machine.startNewSession()

    const sessions = getSessions()
    expect(sessions[0].auditProductive).toBe('')
    expect(sessions[0].auditNotes).toBe('')
    expect(sessions[0].completed).toBe(false)
  })

  it('startNewSession appends a session matching the data-model shape, then resets to setup', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.capture.value = 'reply to Mai'
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    machine.startNewSession()

    const sessions = getSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual({
      id: expect.any(String),
      date: new Date(now).toISOString(),
      taskListText: '- [ ] draft outline',
      plannedDuration: 25,
      actualDuration: 25,
      capture: 'reply to Mai',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'done',
      completed: true,
    })
    expect(sessions[0].actualDuration).toBe(sessions[0].plannedDuration)

    expect(machine.state.value).toBe('setup')
    expect(machine.capture.value).toBe('')
    expect(machine.auditProductive.value).toBe('')
    expect(machine.auditNotes.value).toBe('')
    expect(getActiveSession()).toBeNull()
  })

  it('startNewSession reads the live Task List at finalization time, not a value cached at session start', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    setGoalsList({ text: '- [x] draft outline\n- [ ] send invoice', updatedAt: null })
    machine.startNewSession()

    const sessions = getSessions()
    expect(sessions[0].taskListText).toBe('- [x] draft outline\n- [ ] send invoice')
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
  it('persists state and timer on transition', async () => {
    const machine = useSessionMachine()
    machine.startSession(1000)
    await nextTick()
    expect(getActiveSession()).toEqual({
      state: 'active',
      timer: expect.objectContaining({ running: true }),
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: 1000,
      primerSkipped: false,
      stoppedEarly: false,
      actualDurationMs: null,
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
  it('restores state from a stored activeSession', () => {
    const startedAt = Date.now() - 60 * 1000 // 1 minute into a 25-minute block
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('active')
    machine.tick(startedAt + 60 * 1000)
    expect(machine.remainingMs.value).toBe(24 * 60 * 1000)
  })

  it('snaps to the correct downstream state if the timer already elapsed while unloaded', () => {
    const startedAt = Date.now() - 30 * 60 * 1000 // a 25-minute block that ended 5 minutes ago
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('blockEnd')
  })

  it('restores capture, usedPrimer, audit answers, and sessionStartedAt from a stored activeSession', () => {
    const sessionStartedAt = Date.now() - 60 * 1000
    setActiveSession({
      state: 'summary',
      timer: null,
      capture: 'reply to Mai',
      usedPrimer: true,
      auditProductive: 'mixed',
      auditNotes: 'tabbed out twice',
      sessionStartedAt,
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('summary')
    expect(machine.capture.value).toBe('reply to Mai')
    expect(machine.usedPrimer.value).toBe(true)
    expect(machine.auditProductive.value).toBe('mixed')
    expect(machine.auditNotes.value).toBe('tabbed out twice')
  })

  it('restores a skipped primer so the commit/stop choice survives a reload, instead of reverting to waiting out the countdown', () => {
    const startedAt = Date.now() - 30 * 1000 // 30s into the 2-minute primer, well before it finishes
    setActiveSession({
      state: 'primer',
      timer: { durationMs: 2 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
      primerSkipped: true,
    })
    const machine = useSessionMachine()
    expect(machine.state.value).toBe('primer')
    expect(machine.showPrimerChoice.value).toBe(true)
  })
})
