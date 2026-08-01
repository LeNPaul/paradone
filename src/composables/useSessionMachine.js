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
  const actualDurationMs = ref(stored?.actualDurationMs ?? null)

  const remainingMs = computed(() => (timer.value ? getRemainingMs(timer.value, now.value) : 0))
  const isPaused = computed(() => !!timer.value && !timer.value.running)
  const showPrimerChoice = computed(
    () => state.value === 'primer' && (primerSkipped.value || isFinished(timer.value, now.value)),
  )

  function tick(at = Date.now()) {
    now.value = at
    if (!timer.value) return
    if (state.value === 'active' && isFinished(timer.value, at)) {
      actualDurationMs.value = timer.value.durationMs - getRemainingMs(timer.value, at)
      state.value = 'blockEnd'
    } else if (state.value === 'break' && isFinished(timer.value, at)) state.value = 'audit'
  }
  tick(now.value) // correct immediately on rehydration, don't wait for the first interval tick

  function updatePrefs(newPrefs) {
    Object.assign(prefs, newPrefs)
    setPrefs({ ...prefs })
  }

  function startSession(at = Date.now()) {
    timer.value = start(createTimer(prefs.workDuration), at)
    sessionStartedAt.value = at
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
    usedPrimer.value = true
    state.value = 'active'
  }

  function stopPrimer() {
    timer.value = null
    capture.value = ''
    primerIntent.value = ''
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
    actualDurationMs.value = timer.value.durationMs - getRemainingMs(timer.value, at)
    stoppedEarly.value = true
    state.value = 'audit'
  }

  function takeBreak(at = Date.now()) {
    timer.value = start(createTimer(prefs.breakDuration), at)
    state.value = 'break'
  }

  function keepGoing() {
    state.value = 'audit'
  }

  // Appended when the audit is answered or skipped, not when the user later
  // clicks "Start new session" — otherwise closing the tab at the summary
  // screen would silently discard the audit.
  function logSession() {
    const sessions = getSessions()
    sessions.push({
      id: crypto.randomUUID(),
      date: new Date(sessionStartedAt.value).toISOString(),
      auditedAt: new Date().toISOString(),
      taskListText: getGoalsList().text,
      plannedDuration: prefs.workDuration,
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
    actualDurationMs.value = null
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
      actualDurationMs,
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
              actualDurationMs: actualDurationMs.value,
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
    isPaused,
    showPrimerChoice,
    prefs,
    capture,
    usedPrimer,
    primerIntent,
    auditProductive,
    auditNotes,
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
    keepGoing,
    submitAudit,
    skipAudit,
    startNewSession,
    tick,
  }
}
