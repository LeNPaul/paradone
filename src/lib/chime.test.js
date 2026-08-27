import { describe, it, expect, beforeEach, vi } from 'vitest'

// chime.js caches its AudioContext at module scope, so every case re-imports
// through a reset registry to get a fresh one.
async function loadChime() {
  vi.resetModules()
  return (await import('./chime.js')).playChime
}

function fakeAudioContext(state = 'running') {
  const oscillators = []
  const gains = []
  const ctx = {
    state,
    currentTime: 10,
    destination: { id: 'destination' },
    resume: vi.fn(),
    createOscillator() {
      const osc = {
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
      oscillators.push(osc)
      return osc
    },
    createGain() {
      const gain = {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }
      gains.push(gain)
      return gain
    },
  }
  globalThis.AudioContext = vi.fn(() => ctx)
  return { ctx, oscillators, gains }
}

beforeEach(() => {
  delete globalThis.AudioContext
})

describe('playChime', () => {
  it('schedules the two bell notes, each through its own gain to the destination', async () => {
    const { ctx, oscillators, gains } = fakeAudioContext()
    const playChime = await loadChime()

    playChime()

    expect(oscillators.map((o) => o.frequency.value)).toEqual([880, 1318.5])
    expect(oscillators.every((o) => o.type === 'sine')).toBe(true)
    oscillators.forEach((osc, i) => {
      expect(osc.connect).toHaveBeenCalledWith(gains[i])
      expect(gains[i].connect).toHaveBeenCalledWith(ctx.destination)
      expect(osc.start).toHaveBeenCalled()
      expect(osc.stop).toHaveBeenCalled()
    })
  })

  it('offsets the second note and stops each one after its release', async () => {
    const { oscillators } = fakeAudioContext()
    const playChime = await loadChime()

    playChime()

    expect(oscillators[0].start).toHaveBeenCalledWith(10)
    expect(oscillators[1].start).toHaveBeenCalledWith(10.18)
    expect(oscillators[0].stop.mock.calls[0][0]).toBeGreaterThan(10)
    expect(oscillators[1].stop.mock.calls[0][0]).toBeGreaterThan(
      oscillators[0].stop.mock.calls[0][0],
    )
  })

  // exponentialRampToValueAtTime throws on a zero target, so the decay has to
  // approach silence rather than reach it.
  it('never ramps the gain to zero', async () => {
    const { gains } = fakeAudioContext()
    const playChime = await loadChime()

    playChime()

    for (const gain of gains) {
      for (const [target] of gain.gain.exponentialRampToValueAtTime.mock.calls) {
        expect(target).toBeGreaterThan(0)
      }
    }
  })

  it('resumes a suspended context before scheduling', async () => {
    const { ctx } = fakeAudioContext('suspended')
    const playChime = await loadChime()

    playChime()

    expect(ctx.resume).toHaveBeenCalled()
  })

  it('reuses one context across chimes rather than opening one per block', async () => {
    fakeAudioContext()
    const playChime = await loadChime()

    playChime()
    playChime()

    expect(AudioContext).toHaveBeenCalledTimes(1)
  })

  it('is a no-op where Web Audio is unavailable', async () => {
    const playChime = await loadChime()
    expect(() => playChime()).not.toThrow()
  })
})
