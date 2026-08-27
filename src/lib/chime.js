// chime.js — the block-end bell, synthesized with the Web Audio API rather than
// shipped as an audio file: no asset in the repo and no new runtime dependency.

// A5 then E6, a two-note bell rather than a single flat beep.
const NOTES = [880, 1318.5]
const NOTE_GAP = 0.18
const RELEASE = 0.7
const PEAK = 0.25
// exponentialRampToValueAtTime rejects 0, so silence is approached, never reached.
const SILENCE = 0.0001

// One context for the life of the page: a new one per chime would leak one per
// block, and browsers cap how many a page may hold.
let ctx = null

function context() {
  if (typeof AudioContext === 'undefined') return null // jsdom, and browsers without Web Audio
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playChime() {
  const ac = context()
  if (!ac) return
  // The tab has had a user gesture (the Start button) long before any block
  // ends, so autoplay policy lets a suspended context resume here.
  if (ac.state === 'suspended') ac.resume()

  NOTES.forEach((frequency, i) => {
    const at = ac.currentTime + i * NOTE_GAP
    const osc = ac.createOscillator()
    const gain = ac.createGain()

    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(SILENCE, at)
    gain.gain.exponentialRampToValueAtTime(PEAK, at + 0.01)
    gain.gain.exponentialRampToValueAtTime(SILENCE, at + RELEASE)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(at)
    osc.stop(at + RELEASE + 0.05)
  })
}
