import { describe, it, expect } from 'vitest'
import { createTimer, start, pause, resume, reset, getRemainingMs, isFinished, formatMs } from './timer.js'

describe('createTimer', () => {
  it('converts minutes to milliseconds', () => {
    const timer = createTimer(25)
    expect(timer.durationMs).toBe(25 * 60 * 1000)
  })

  it('starts not running with zero elapsed time', () => {
    const timer = createTimer(25)
    expect(timer.running).toBe(false)
    expect(timer.elapsedMs).toBe(0)
    expect(timer.startedAt).toBe(null)
  })
})

describe('getRemainingMs', () => {
  it('is the full duration before the timer starts', () => {
    const timer = createTimer(25)
    expect(getRemainingMs(timer, 0)).toBe(25 * 60 * 1000)
  })

  it('decreases as time passes after start', () => {
    const timer = start(createTimer(25), 1000)
    expect(getRemainingMs(timer, 1000 + 60 * 1000)).toBe(24 * 60 * 1000)
  })

  it('clamps to zero once the duration has elapsed', () => {
    const timer = start(createTimer(1), 0)
    expect(getRemainingMs(timer, 5 * 60 * 1000)).toBe(0)
  })
})

describe('pause and resume', () => {
  it('freezes the remaining time while paused', () => {
    const running = start(createTimer(25), 0)
    const paused = pause(running, 60 * 1000)
    const remainingAtPause = getRemainingMs(paused, 60 * 1000)
    expect(getRemainingMs(paused, 10 * 60 * 1000)).toBe(remainingAtPause)
  })

  it('continues counting down from where it paused after resuming', () => {
    const running = start(createTimer(25), 0)
    const paused = pause(running, 60 * 1000) // 1 minute elapsed
    const resumed = resume(paused, 5 * 60 * 1000) // resumes at the 5 minute mark
    // 1 more minute passes after resuming
    expect(getRemainingMs(resumed, 6 * 60 * 1000)).toBe(23 * 60 * 1000)
  })

  it('pausing an already-paused timer is a no-op', () => {
    const running = start(createTimer(25), 0)
    const paused = pause(running, 60 * 1000)
    expect(pause(paused, 5 * 60 * 1000)).toEqual(paused)
  })

  it('resuming an already-running timer is a no-op', () => {
    const running = start(createTimer(25), 0)
    expect(resume(running, 5 * 60 * 1000)).toEqual(running)
  })
})

describe('reset', () => {
  it('returns the timer to its full, not-running duration', () => {
    const running = start(createTimer(25), 0)
    const paused = pause(running, 10 * 60 * 1000)
    const resetTimer = reset(paused)
    expect(resetTimer.running).toBe(false)
    expect(getRemainingMs(resetTimer, 0)).toBe(25 * 60 * 1000)
  })
})

describe('isFinished', () => {
  it('is false while time remains', () => {
    const timer = start(createTimer(25), 0)
    expect(isFinished(timer, 60 * 1000)).toBe(false)
  })

  it('is true once the duration has fully elapsed', () => {
    const timer = start(createTimer(25), 0)
    expect(isFinished(timer, 25 * 60 * 1000)).toBe(true)
  })

  it('is true past the duration, not just exactly at it', () => {
    const timer = start(createTimer(25), 0)
    expect(isFinished(timer, 30 * 60 * 1000)).toBe(true)
  })
})

describe('formatMs', () => {
  it('pads minutes and seconds to two digits', () => {
    expect(formatMs(0)).toBe('00:00')
    expect(formatMs(61 * 1000)).toBe('01:01')
  })

  it('floors partial seconds rather than rounding up', () => {
    expect(formatMs(1999)).toBe('00:01')
  })

  it('formats a full work duration', () => {
    expect(formatMs(25 * 60 * 1000)).toBe('25:00')
  })

  it('lets minutes run past 60 instead of rolling over to hours', () => {
    expect(formatMs(90 * 60 * 1000)).toBe('90:00')
  })
})
