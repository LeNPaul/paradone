// timer.js — countdown/tick math, duration calculations.
// Time-dependent functions take `now` explicitly rather than reading
// Date.now() themselves, so remaining time survives a page reload by being
// recomputed from timestamps instead of a decrementing in-memory counter.

export function createTimer(durationMinutes) {
  return {
    durationMs: durationMinutes * 60 * 1000,
    startedAt: null,
    elapsedMs: 0,
    running: false,
  }
}

export function start(timer, now) {
  return { ...timer, startedAt: now, elapsedMs: 0, running: true }
}

export function pause(timer, now) {
  if (!timer.running) return timer
  return { ...timer, startedAt: null, elapsedMs: timer.elapsedMs + (now - timer.startedAt), running: false }
}

export function resume(timer, now) {
  if (timer.running) return timer
  return { ...timer, startedAt: now, running: true }
}

export function reset(timer) {
  return createTimer(timer.durationMs / (60 * 1000))
}

export function getRemainingMs(timer, now) {
  const elapsed = timer.elapsedMs + (timer.running ? now - timer.startedAt : 0)
  return Math.max(0, timer.durationMs - elapsed)
}

export function isFinished(timer, now) {
  return getRemainingMs(timer, now) <= 0
}
