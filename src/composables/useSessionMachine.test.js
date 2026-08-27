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

    const sessions = getSessions()
    expect(sessions[0].completed).toBe(false)
    expect(sessions[0].plannedDuration).toBe(25)
    expect(sessions[0].actualDuration).toBe(5)
  })
})

describe('block end', () => {
  it('takeBreak moves blockEnd -> break with a break-duration timer, auto-ending back to blockEnd', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    expect(machine.state.value).toBe('break')
    machine.tick(now + 25 * 60 * 1000 + 5 * 60 * 1000)
    expect(machine.state.value).toBe('blockEnd')
  })

  it('endBreak ends an in-progress break early, moving break -> blockEnd', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    expect(machine.state.value).toBe('break')
    machine.endBreak()
    expect(machine.state.value).toBe('blockEnd')
  })

  it('keepGoing chains another block after a break has run its course', () => {
    const machine = useSessionMachine()
    const now = 1000
    const breakEndedAt = now + 30 * 60 * 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    machine.tick(breakEndedAt)
    machine.keepGoing(breakEndedAt)
    expect(machine.state.value).toBe('active')
    expect(machine.remainingMs.value).toBe(25 * 60 * 1000)

    machine.tick(breakEndedAt + 25 * 60 * 1000)
    machine.endSession()
    machine.skipAudit()
    const sessions = getSessions()
    expect(sessions[0].plannedDuration).toBe(50)
    expect(sessions[0].actualDuration).toBe(50)
  })

  it('flags blockEnd as after a break only when it was reached from one', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    expect(machine.afterBreak.value).toBe(false)

    machine.takeBreak(now + 25 * 60 * 1000)
    machine.endBreak()
    expect(machine.afterBreak.value).toBe(true)

    machine.keepGoing(now + 26 * 60 * 1000)
    machine.tick(now + 51 * 60 * 1000)
    expect(machine.state.value).toBe('blockEnd')
    expect(machine.afterBreak.value).toBe(false)
  })

  it('endBreak does nothing outside the break state', () => {
    const machine = useSessionMachine()
    machine.startSession(1000)
    machine.endBreak()
    expect(machine.state.value).toBe('active')
  })

  it('keepGoing moves blockEnd -> active with a fresh work-duration timer', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing(now + 25 * 60 * 1000)
    expect(machine.state.value).toBe('active')
    expect(machine.totalMs.value).toBe(25 * 60 * 1000)
    expect(machine.remainingMs.value).toBe(25 * 60 * 1000)
  })

  it('keepGoing does nothing outside the block-end state', () => {
    const machine = useSessionMachine()
    machine.startSession(1000)
    machine.keepGoing(2000)
    expect(machine.state.value).toBe('active')
  })

  it('endSession moves blockEnd -> audit directly, without creating a break timer', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()
    expect(machine.state.value).toBe('audit')
  })

  it('endSession does nothing outside the block-end state', () => {
    const machine = useSessionMachine()
    machine.startSession(1000)
    machine.endSession()
    expect(machine.state.value).toBe('active')
  })
})

describe('focused time so far', () => {
  it('is zero before a session starts', () => {
    const machine = useSessionMachine()
    expect(machine.focusedMs.value).toBe(0)
  })

  it('counts the running block as it elapses', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 10 * 60 * 1000)
    expect(machine.focusedMs.value).toBe(10 * 60 * 1000)
  })

  it('stops climbing while paused and resumes with the resumed block', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.pauseSession(now + 10 * 60 * 1000)
    machine.tick(now + 20 * 60 * 1000)
    expect(machine.focusedMs.value).toBe(10 * 60 * 1000)

    machine.resumeSession(now + 20 * 60 * 1000)
    machine.tick(now + 25 * 60 * 1000)
    expect(machine.focusedMs.value).toBe(15 * 60 * 1000)
  })

  it('holds the finished block at blockEnd without counting it twice', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    expect(machine.state.value).toBe('blockEnd')
    expect(machine.focusedMs.value).toBe(25 * 60 * 1000)
  })

  it('does not count break time', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    machine.tick(now + 28 * 60 * 1000)
    expect(machine.focusedMs.value).toBe(25 * 60 * 1000)

    machine.tick(now + 30 * 60 * 1000)
    expect(machine.state.value).toBe('blockEnd')
    expect(machine.focusedMs.value).toBe(25 * 60 * 1000)
  })

  it('accumulates across blocks chained with keepGoing', () => {
    const machine = useSessionMachine()
    const now = 1000
    const breakEndedAt = now + 30 * 60 * 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    machine.tick(breakEndedAt)
    machine.keepGoing(breakEndedAt)
    machine.tick(breakEndedAt + 5 * 60 * 1000)
    expect(machine.focusedMs.value).toBe(30 * 60 * 1000)

    machine.tick(breakEndedAt + 25 * 60 * 1000)
    expect(machine.state.value).toBe('blockEnd')
    expect(machine.focusedMs.value).toBe(50 * 60 * 1000)
  })

  it('matches the actualDuration logged for the session', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing(now + 25 * 60 * 1000)
    machine.tick(now + 40 * 60 * 1000)
    const shown = machine.focusedMs.value
    machine.stopSession(now + 40 * 60 * 1000)
    machine.skipAudit()
    expect(getSessions()[0].actualDuration).toBe(shown / (60 * 1000))
  })
})

describe('primer', () => {
  it('openPrimerSetup moves setup -> primerSetup without starting a countdown', () => {
    const machine = useSessionMachine()
    machine.openPrimerSetup()
    expect(machine.state.value).toBe('primerSetup')
    expect(machine.remainingMs.value).toBe(0)
  })

  it('cancelPrimerSetup returns to setup and discards the drafted breakdown', () => {
    const machine = useSessionMachine()
    machine.openPrimerSetup()
    machine.primerIntent.value = 'open the doc'
    machine.cancelPrimerSetup()
    expect(machine.state.value).toBe('setup')
    expect(machine.primerIntent.value).toBe('')
  })

  it('startPrimer trims the breakdown text', () => {
    const machine = useSessionMachine()
    machine.openPrimerSetup()
    machine.primerIntent.value = '  open the doc\n'
    machine.startPrimer(1000)
    expect(machine.primerIntent.value).toBe('open the doc')
  })

  it('the breakdown survives commitFullSession into the active block', () => {
    const machine = useSessionMachine()
    machine.openPrimerSetup()
    machine.primerIntent.value = 'open the doc'
    machine.startPrimer(1000)
    machine.commitFullSession(1000 + 2 * 60 * 1000)
    expect(machine.state.value).toBe('active')
    expect(machine.primerIntent.value).toBe('open the doc')
  })

  it('stopPrimer and startNewSession each clear the breakdown', () => {
    const stopped = useSessionMachine()
    stopped.primerIntent.value = 'open the doc'
    stopped.startPrimer(1000)
    stopped.stopPrimer()
    expect(stopped.primerIntent.value).toBe('')

    const restarted = useSessionMachine()
    restarted.primerIntent.value = 'open the doc'
    restarted.startPrimer(1000)
    restarted.commitFullSession(1000)
    restarted.startNewSession()
    expect(restarted.primerIntent.value).toBe('')
  })

  it('a session started directly carries no breakdown', () => {
    const machine = useSessionMachine()
    machine.primerIntent.value = 'open the doc'
    machine.startSession(1000)
    expect(machine.primerIntent.value).toBe('')
  })

  it('logs the breakdown with the audited session', () => {
    const machine = useSessionMachine()
    machine.openPrimerSetup()
    machine.primerIntent.value = 'open the doc'
    machine.startPrimer(1000)
    machine.commitFullSession(1000 + 2 * 60 * 1000)
    machine.stopSession(1000 + 7 * 60 * 1000)
    machine.submitAudit({ auditProductive: 'focused', auditNotes: '' })

    expect(getSessions()[0].primerIntent).toBe('open the doc')
  })

  it('persists the breakdown so a reload during primerSetup keeps the draft', async () => {
    const machine = useSessionMachine()
    machine.openPrimerSetup()
    machine.primerIntent.value = 'open the doc'
    await nextTick()
    expect(getActiveSession().primerIntent).toBe('open the doc')

    const reloaded = useSessionMachine()
    expect(reloaded.state.value).toBe('primerSetup')
    expect(reloaded.primerIntent.value).toBe('open the doc')
  })

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
    expect(getPrefs()).toEqual({ workDuration: 40, breakDuration: 0, addTaskKey: 'n', sound: true, notify: false })
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
    machine.endSession()
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

  it('discardSession returns to setup without logging anything', async () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.stopSession(now + 5 * 60 * 1000)
    machine.discardSession()

    expect(machine.state.value).toBe('setup')
    expect(getSessions()).toEqual([])
    await nextTick()
    expect(getActiveSession()).toBeNull()
  })

  it('discardSession does nothing outside the audit state', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.discardSession()
    expect(machine.state.value).toBe('active')
  })

  it('a skipped audit is logged with empty audit fields', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.stopSession(now + 5 * 60 * 1000)
    machine.skipAudit()

    const sessions = getSessions()
    expect(sessions[0].auditProductive).toBe('')
    expect(sessions[0].auditNotes).toBe('')
    expect(sessions[0].completed).toBe(false)
  })

  it('submitAudit appends a session matching the data-model shape', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.capture.value = 'reply to Mai'
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    const sessions = getSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual({
      id: expect.any(String),
      date: new Date(now).toISOString(),
      auditedAt: expect.any(String),
      taskListText: '- [ ] draft outline',
      completedTasks: [],
      addedTasks: [],
      plannedDuration: 25,
      actualDuration: 25,
      capture: 'reply to Mai',
      usedPrimer: false,
      primerIntent: '',
      auditProductive: 'focused',
      auditNotes: 'done',
      completed: true,
    })
    expect(sessions[0].actualDuration).toBe(sessions[0].plannedDuration)
    expect(new Date(sessions[0].auditedAt).toISOString()).toBe(sessions[0].auditedAt)
  })

  it('records tasks added mid-session separately from ones that pre-existed it', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    // Both ticked during the block, but only one was on the list when it began.
    setGoalsList({ text: '- [x] draft outline\n- [x] reply to Mai', updatedAt: null })
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    const session = getSessions()[0]
    expect(session.completedTasks).toEqual(['draft outline', 'reply to Mai'])
    expect(session.addedTasks).toEqual(['reply to Mai'])
  })

  it('records an added task that was never ticked, without counting it completed', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    setGoalsList({ text: '- [ ] draft outline\n- [ ] reply to Mai', updatedAt: null })
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()
    machine.skipAudit()

    const session = getSessions()[0]
    expect(session.completedTasks).toEqual([])
    expect(session.addedTasks).toEqual(['reply to Mai'])
  })

  it('startNewSession resets to setup without logging the session a second time', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.capture.value = 'reply to Mai'
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })
    expect(getSessions()).toHaveLength(1)

    machine.startNewSession()

    expect(getSessions()).toHaveLength(1)
    expect(machine.state.value).toBe('setup')
    expect(machine.capture.value).toBe('')
    expect(machine.auditProductive.value).toBe('')
    expect(machine.auditNotes.value).toBe('')
    expect(getActiveSession()).toBeNull()
  })

  it('logs the audit as soon as it is answered, so abandoning the summary screen does not lose it', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    // No startNewSession() — this is the "closed the tab at the summary" case.
    expect(getSessions()).toHaveLength(1)
    expect(getSessions()[0].auditNotes).toBe('done')
  })

  it('reads the live Task List at audit time, not a value cached at session start', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()

    setGoalsList({ text: '- [x] draft outline\n- [ ] send invoice', updatedAt: null })
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    const sessions = getSessions()
    expect(sessions[0].taskListText).toBe('- [x] draft outline\n- [ ] send invoice')
  })

  it('logs only the tasks checked off during the block, not ones already checked at the start', () => {
    setGoalsList({ text: '- [x] send invoice\n- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()

    setGoalsList({ text: '- [x] send invoice\n- [x] draft outline', updatedAt: null })
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    expect(getSessions()[0].completedTasks).toEqual(['draft outline'])
  })

  it('counts a task added mid-session and then checked', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()

    setGoalsList({ text: '- [ ] draft outline\n- [x] reply to Mai', updatedAt: null })
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    expect(getSessions()[0].completedTasks).toEqual(['reply to Mai'])
  })

  it('records completed tasks on a skipped audit too', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.endSession()

    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    machine.skipAudit()

    expect(getSessions()[0].completedTasks).toEqual(['draft outline'])
  })

  it('records the work block\'s own start time and duration, not the break\'s, when a break was taken', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    machine.tick(now + 25 * 60 * 1000 + 5 * 60 * 1000)
    machine.endSession()
    machine.submitAudit({ auditProductive: 'mixed', auditNotes: '' })

    const sessions = getSessions()
    expect(sessions[0].date).toBe(new Date(now).toISOString())
    expect(sessions[0].plannedDuration).toBe(25)
    expect(sessions[0].actualDuration).toBe(25)
  })

  it('records the full work block when the break was ended early', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)
    machine.tick(now + 25 * 60 * 1000 + 60 * 1000)
    machine.endBreak()
    machine.endSession()
    machine.skipAudit()

    const sessions = getSessions()
    expect(sessions[0].date).toBe(new Date(now).toISOString())
    expect(sessions[0].actualDuration).toBe(25)
    expect(sessions[0].completed).toBe(true)
  })

  it('logs blocks chained with keepGoing as one session with accumulated durations', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing(now + 25 * 60 * 1000)
    machine.tick(now + 50 * 60 * 1000)
    machine.endSession()

    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'two blocks' })

    const sessions = getSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].date).toBe(new Date(now).toISOString())
    expect(sessions[0].plannedDuration).toBe(50)
    expect(sessions[0].actualDuration).toBe(50)
    expect(sessions[0].completed).toBe(true)
    // The snapshot is the first block's, so the tick still counts.
    expect(sessions[0].completedTasks).toEqual(['draft outline'])
  })

  it('counts the part-finished block when a chained session is stopped early', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing(now + 25 * 60 * 1000)
    machine.stopSession(now + 30 * 60 * 1000)
    machine.skipAudit()

    const sessions = getSessions()
    expect(sessions[0].plannedDuration).toBe(50)
    expect(sessions[0].actualDuration).toBe(30)
    expect(sessions[0].completed).toBe(false)
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
      primerIntent: '',
      stoppedEarly: false,
      afterBreak: false,
      actualDurationMs: null,
      plannedDurationMin: 25,
      taskListStartText: '',
    })
  })

  it('persists the accumulated planned duration after keepGoing chains a block', async () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.keepGoing(now + 25 * 60 * 1000)
    await nextTick()
    expect(getActiveSession().plannedDurationMin).toBe(50)
    expect(getActiveSession().actualDurationMs).toBe(25 * 60 * 1000)
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

  it('restores the Task List start snapshot, so a reload mid-session still diffs against the right baseline', () => {
    const sessionStartedAt = Date.now() - 60 * 1000
    setActiveSession({
      state: 'blockEnd',
      timer: null,
      sessionStartedAt,
      taskListStartText: '- [x] send invoice\n- [ ] draft outline',
    })
    const machine = useSessionMachine()
    expect(machine.taskListStartText.value).toBe('- [x] send invoice\n- [ ] draft outline')

    setGoalsList({ text: '- [x] send invoice\n- [x] draft outline', updatedAt: null })
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    expect(getSessions()[0].completedTasks).toEqual(['draft outline'])
  })

  it('reports no completed tasks for a session stored before the snapshot existed, rather than claiming every checked task', () => {
    const sessionStartedAt = Date.now() - 60 * 1000
    setActiveSession({ state: 'blockEnd', timer: null, sessionStartedAt })
    setGoalsList({ text: '- [x] send invoice\n- [x] draft outline', updatedAt: null })

    const machine = useSessionMachine()
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    expect(getSessions()[0].completedTasks).toEqual([])
  })

  it('restores the accumulated durations of a chained session, so a reload mid-chain still logs every block', () => {
    const sessionStartedAt = Date.now() - 50 * 60 * 1000
    setActiveSession({
      state: 'blockEnd',
      timer: null,
      sessionStartedAt,
      actualDurationMs: 50 * 60 * 1000,
      plannedDurationMin: 50,
    })
    const machine = useSessionMachine()
    machine.endSession()
    machine.submitAudit({ auditProductive: 'focused', auditNotes: 'done' })

    const sessions = getSessions()
    expect(sessions[0].plannedDuration).toBe(50)
    expect(sessions[0].actualDuration).toBe(50)
  })

  it('falls back to the current work duration for a session stored before chained durations existed', () => {
    const sessionStartedAt = Date.now() - 25 * 60 * 1000
    setActiveSession({ state: 'blockEnd', timer: null, sessionStartedAt })

    const machine = useSessionMachine()
    machine.endSession()
    machine.skipAudit()

    expect(getSessions()[0].plannedDuration).toBe(25)
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

describe('timerEnds — the countdown-ran-out signal alerts hang off', () => {
  it('bumps when a work block runs out on its own', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    expect(machine.timerEnds.value).toBe(0)

    machine.tick(now + 25 * 60 * 1000)

    expect(machine.timerEnds.value).toBe(1)
  })

  it('bumps again when a break runs out on its own', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)

    machine.tick(now + 30 * 60 * 1000)

    expect(machine.timerEnds.value).toBe(2)
  })

  // Both reach blockEnd/audit by a button press, and the user pressing it is
  // already looking at the screen.
  it('stays put when the user ends a break early', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    machine.takeBreak(now + 25 * 60 * 1000)

    machine.endBreak()

    expect(machine.state.value).toBe('blockEnd')
    expect(machine.timerEnds.value).toBe(1)
  })

  it('stays put when the user stops the block early', () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)

    machine.stopSession(now + 5 * 60 * 1000)

    expect(machine.state.value).toBe('audit')
    expect(machine.timerEnds.value).toBe(0)
  })

  // A stale count read back from paradone:activeSession would ring the bell on
  // every reload, so it is deliberately not persisted.
  it('is not persisted to the in-flight session', async () => {
    const machine = useSessionMachine()
    const now = 1000
    machine.startSession(now)
    machine.tick(now + 25 * 60 * 1000)
    await nextTick()

    expect(getActiveSession().state).toBe('blockEnd')
    expect(getActiveSession()).not.toHaveProperty('timerEnds')
  })
})
