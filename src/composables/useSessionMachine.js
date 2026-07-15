// useSessionMachine.js — drives the single-page state machine (setup | primer
// | active | blockEnd | break | audit | summary), ticking timer.js countdowns
// and persisting the in-progress block to paradone:activeSession so a reload
// doesn't lose it.
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createTimer, start, getRemainingMs, isFinished } from '../lib/timer.js'
import { getPrefs, getActiveSession, setActiveSession } from '../lib/storage.js'

const PRIMER_DURATION_MINUTES = 2

export function useSessionMachine() {
  const prefs = getPrefs()
  const stored = getActiveSession()

  const state = ref(stored?.state ?? 'setup')
  const sessionGoalText = ref(stored?.sessionGoalText ?? '')
  const timer = ref(stored?.timer ?? null)
  const now = ref(Date.now())
  const primerSkipped = ref(false)

  const remainingMs = computed(() => (timer.value ? getRemainingMs(timer.value, now.value) : 0))
  const showPrimerChoice = computed(
    () => state.value === 'primer' && (primerSkipped.value || isFinished(timer.value, now.value)),
  )

  function tick(at = Date.now()) {
    now.value = at
    if (!timer.value) return
    if (state.value === 'active' && isFinished(timer.value, at)) state.value = 'blockEnd'
    else if (state.value === 'break' && isFinished(timer.value, at)) state.value = 'audit'
  }
  tick(now.value) // correct immediately on rehydration, don't wait for the first interval tick

  function startSession(at = Date.now()) {
    timer.value = start(createTimer(prefs.workDuration), at)
    state.value = 'active'
  }

  function startPrimer(at = Date.now()) {
    primerSkipped.value = false
    timer.value = start(createTimer(PRIMER_DURATION_MINUTES), at)
    state.value = 'primer'
  }

  function skipPrimerCountdown() {
    primerSkipped.value = true
  }

  function commitFullSession(at = Date.now()) {
    timer.value = start(createTimer(prefs.workDuration), at)
    state.value = 'active'
  }

  function stopPrimer() {
    timer.value = null
    state.value = 'setup'
  }

  function takeBreak(at = Date.now()) {
    timer.value = start(createTimer(prefs.breakDuration), at)
    state.value = 'break'
  }

  function keepGoing() {
    state.value = 'audit'
  }

  watch([state, sessionGoalText, timer], () => {
    setActiveSession(
      state.value === 'setup'
        ? null
        : { state: state.value, sessionGoalText: sessionGoalText.value, timer: timer.value },
    )
  })

  let intervalId
  onMounted(() => {
    intervalId = setInterval(() => tick(), 250)
  })
  onUnmounted(() => clearInterval(intervalId))

  return {
    state,
    sessionGoalText,
    remainingMs,
    showPrimerChoice,
    prefs,
    startSession,
    startPrimer,
    skipPrimerCountdown,
    commitFullSession,
    stopPrimer,
    takeBreak,
    keepGoing,
    tick,
  }
}
