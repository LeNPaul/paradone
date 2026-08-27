// useSessionMachine.js — drives the single-page state machine (setup |
// primerSetup | primer | active | blockEnd | break | audit | summary), ticking
// timer.js countdowns and persisting the in-progress block to
// paradone:activeSession so a reload doesn't lose it.
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { createTimer, start, pause, resume, getRemainingMs, isFinished } from '../lib/timer.js'
import {
  getPrefs,
  setPrefs,
  getActiveSession,
  setActiveSession,
  getSessions,
  setSessions,
  getGoalsList,
} from '../lib/storage.js'
import { completedSince, addedSince } from '../lib/checklist.js'

const PRIMER_DURATION_MINUTES = 2

export function useSessionMachine() {
  const prefs = reactive(getPrefs())
  const stored = getActiveSession()

  const state = ref(stored?.state ?? 'setup')
  const timer = ref(stored?.timer ?? null)
  const capture = ref(stored?.capture ?? '')
  const usedPrimer = ref(stored?.usedPrimer ?? false)
  const auditProductive = ref(stored?.auditProductive ?? '')
  const auditNotes = ref(stored?.auditNotes ?? '')
  const sessionStartedAt = ref(stored?.sessionStartedAt ?? null)
  const now = ref(Date.now())
  const primerSkipped = ref(stored?.primerSkipped ?? false)
  const primerIntent = ref(stored?.primerIntent ?? '')
  const stoppedEarly = ref(stored?.stoppedEarly ?? false)
  // Display-only: whether blockEnd was reached from a break rather than from a
  // work block finishing. Drives the copy on that screen, never a guard.
  const afterBreak = ref(stored?.afterBreak ?? false)
  const actualDurationMs = ref(stored?.actualDurationMs ?? null)
  // Planned minutes across every block chained into this session. null means "no
  // record" — a session rehydrated from before this existed falls back to the
  // current work duration rather than logging 0.
  const plannedDurationMin = ref(stored?.plannedDurationMin ?? null)
  // Task List snapshot taken when the block started, diffed against the list at
  // audit time to work out what got ticked off during it. null means "no
  // snapshot" — a session rehydrated from before this existed reports nothing
  // rather than claiming every already-checked task was done in this block.
  const taskListStartText = ref(stored?.taskListStartText ?? null)
  // Bumped only where a countdown runs out on its own, so alerts can hang off
  // it. Deliberately not persisted to activeSession — a stored count would ring
  // a stale bell on reload. endBreak() and stopSession() reach the same states
  // manually and leave it alone: the user is already looking at the screen.
  const timerEnds = ref(0)

  const remainingMs = computed(() => (timer.value ? getRemainingMs(timer.value, now.value) : 0))
  // The ring's denominator. Comes off the timer itself so it's correct for every
  // variant — work, break, and the fixed 2-minute primer — without reconstruction.
  const totalMs = computed(() => timer.value?.durationMs ?? 0)
  const isPaused = computed(() => !!timer.value && !timer.value.running)
  // Focused time across every block chained into this session, including the one
  // currently running. Breaks and paused time don't count — this is the same
  // number logged as actualDuration, just live.
  const focusedMs = computed(() => {
    const banked = actualDurationMs.value ?? 0
    if (state.value !== 'active' || !timer.value) return banked
    return banked + (timer.value.durationMs - getRemainingMs(timer.value, now.value))
  })
  const showPrimerChoice = computed(
    () => state.value === 'primer' && (primerSkipped.value || isFinished(timer.value, now.value)),
  )

  function tick(at = Date.now()) {
    now.value = at
    if (!timer.value) return
    if (state.value === 'active' && isFinished(timer.value, at)) {
      actualDurationMs.value =
        (actualDurationMs.value ?? 0) + (timer.value.durationMs - getRemainingMs(timer.value, at))
      afterBreak.value = false
      state.value = 'blockEnd'
      timerEnds.value++
    } else if (state.value === 'break' && isFinished(timer.value, at)) {
      afterBreak.value = true
      state.value = 'blockEnd'
      timerEnds.value++
    }
  }
  tick(now.value) // correct immediately on rehydration, don't wait for the first interval tick

  function updatePrefs(newPrefs) {
    Object.assign(prefs, newPrefs)
    setPrefs({ ...prefs })
  }

  function startSession(at = Date.now()) {
    timer.value = start(createTimer(prefs.workDuration), at)
    sessionStartedAt.value = at
    taskListStartText.value = getGoalsList().text
    plannedDurationMin.value = prefs.workDuration
    usedPrimer.value = false
    primerIntent.value = ''
    state.value = 'active'
  }

  function openPrimerSetup() {
    state.value = 'primerSetup'
  }

  function cancelPrimerSetup() {
    primerIntent.value = ''
    state.value = 'setup'
  }

  function startPrimer(at = Date.now()) {
    primerSkipped.value = false
    primerIntent.value = primerIntent.value.trim()
    timer.value = start(createTimer(PRIMER_DURATION_MINUTES), at)
    state.value = 'primer'
  }

  function skipPrimerCountdown() {
    primerSkipped.value = true
  }

  function commitFullSession(at = Date.now()) {
    timer.value = start(createTimer(prefs.workDuration), at)
    sessionStartedAt.value = at
    taskListStartText.value = getGoalsList().text
    plannedDurationMin.value = prefs.workDuration
    usedPrimer.value = true
    state.value = 'active'
  }

  function stopPrimer() {
    timer.value = null
    capture.value = ''
    primerIntent.value = ''
    taskListStartText.value = null
    state.value = 'setup'
  }

  function pauseSession(at = Date.now()) {
    if (state.value !== 'active') return
    timer.value = pause(timer.value, at)
  }

  function resumeSession(at = Date.now()) {
    if (state.value !== 'active') return
    timer.value = resume(timer.value, at)
  }

  function stopSession(at = Date.now()) {
    if (state.value !== 'active') return
    actualDurationMs.value =
      (actualDurationMs.value ?? 0) + (timer.value.durationMs - getRemainingMs(timer.value, at))
    stoppedEarly.value = true
    state.value = 'audit'
  }

  function takeBreak(at = Date.now()) {
    timer.value = start(createTimer(prefs.breakDuration), at)
    state.value = 'break'
  }

  // A break is a pause in the session, not the end of it: either way out of one
  // lands back on the block-end choice so another block can still be chained.
  function endBreak() {
    if (state.value !== 'break') return
    afterBreak.value = true
    state.value = 'blockEnd'
  }

  // Chains another block onto the same session: sessionStartedAt, the Task List
  // snapshot and the capture box all carry over, so one audit covers every block.
  function keepGoing(at = Date.now()) {
    if (state.value !== 'blockEnd') return
    timer.value = start(createTimer(prefs.workDuration), at)
    plannedDurationMin.value = (plannedDurationMin.value ?? 0) + prefs.workDuration
    state.value = 'active'
  }

  function endSession() {
    if (state.value !== 'blockEnd') return
    state.value = 'audit'
  }

  // Appended when the audit is answered or skipped, not when the user later
  // clicks "Start new session" — otherwise closing the tab at the summary
  // screen would silently discard the audit.
  function logSession() {
    const sessions = getSessions()
    const taskListText = getGoalsList().text
    sessions.push({
      id: crypto.randomUUID(),
      date: new Date(sessionStartedAt.value).toISOString(),
      auditedAt: new Date().toISOString(),
      taskListText,
      completedTasks:
        taskListStartText.value === null
          ? []
          : completedSince(taskListStartText.value, taskListText),
      // Derived at log time from the snapshot already in hand, so nothing new
      // has to be tracked across the session or persisted to activeSession.
      addedTasks:
        taskListStartText.value === null ? [] : addedSince(taskListStartText.value, taskListText),
      plannedDuration: plannedDurationMin.value ?? prefs.workDuration,
      actualDuration: Math.round((actualDurationMs.value ?? prefs.workDuration * 60 * 1000) / (60 * 1000)),
      capture: capture.value,
      usedPrimer: usedPrimer.value,
      primerIntent: primerIntent.value,
      auditProductive: auditProductive.value,
      auditNotes: auditNotes.value,
      completed: !stoppedEarly.value,
    })
    setSessions(sessions)
  }

  function submitAudit(answers) {
    auditProductive.value = answers.auditProductive
    auditNotes.value = answers.auditNotes ?? ''
    logSession()
    state.value = 'summary'
  }

  function skipAudit() {
    if (state.value !== 'audit') return
    logSession()
    state.value = 'summary'
  }

  // The escape hatch for a block that wasn't real: no record is written, so the
  // audit log stays something the user can trust. Ticked tasks stay ticked —
  // the Task List is persistent and outlives any one session.
  function discardSession() {
    if (state.value !== 'audit') return
    startNewSession()
  }

  function startNewSession() {
    state.value = 'setup'
    timer.value = null
    capture.value = ''
    usedPrimer.value = false
    primerIntent.value = ''
    auditProductive.value = ''
    auditNotes.value = ''
    sessionStartedAt.value = null
    stoppedEarly.value = false
    afterBreak.value = false
    actualDurationMs.value = null
    plannedDurationMin.value = null
    taskListStartText.value = null
  }

  watch(
    [
      state,
      timer,
      capture,
      usedPrimer,
      auditProductive,
      auditNotes,
      sessionStartedAt,
      primerSkipped,
      primerIntent,
      stoppedEarly,
      afterBreak,
      actualDurationMs,
      plannedDurationMin,
      taskListStartText,
    ],
    () => {
      setActiveSession(
        state.value === 'setup'
          ? null
          : {
              state: state.value,
              timer: timer.value,
              capture: capture.value,
              usedPrimer: usedPrimer.value,
              auditProductive: auditProductive.value,
              auditNotes: auditNotes.value,
              sessionStartedAt: sessionStartedAt.value,
              primerSkipped: primerSkipped.value,
              primerIntent: primerIntent.value,
              stoppedEarly: stoppedEarly.value,
              afterBreak: afterBreak.value,
              actualDurationMs: actualDurationMs.value,
              plannedDurationMin: plannedDurationMin.value,
              taskListStartText: taskListStartText.value,
            },
      )
    },
  )

  let intervalId
  onMounted(() => {
    intervalId = setInterval(() => tick(), 250)
  })
  onUnmounted(() => clearInterval(intervalId))

  return {
    state,
    remainingMs,
    totalMs,
    focusedMs,
    isPaused,
    showPrimerChoice,
    afterBreak,
    timerEnds,
    prefs,
    capture,
    usedPrimer,
    primerIntent,
    auditProductive,
    auditNotes,
    taskListStartText,
    updatePrefs,
    startSession,
    openPrimerSetup,
    cancelPrimerSetup,
    startPrimer,
    skipPrimerCountdown,
    commitFullSession,
    stopPrimer,
    pauseSession,
    resumeSession,
    stopSession,
    takeBreak,
    endBreak,
    keepGoing,
    endSession,
    submitAudit,
    skipAudit,
    discardSession,
    startNewSession,
    tick,
  }
}
