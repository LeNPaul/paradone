import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { sessionTitle, DEFAULT_TITLE } from './title.js'

describe('DEFAULT_TITLE', () => {
  it('matches the static <title> in index.html', () => {
    const html = readFileSync('index.html', 'utf8') // vitest runs from the project root
    expect(html).toContain(`<title>${DEFAULT_TITLE}</title>`)
  })
})

describe('sessionTitle', () => {
  it('shows the countdown and Focus label during an active session', () => {
    expect(sessionTitle('active', 24 * 60 * 1000 + 31 * 1000, false)).toBe('⏱ 24:31 Focus — Paradone')
  })

  it('marks a paused session with a pause glyph', () => {
    expect(sessionTitle('active', 24 * 60 * 1000 + 31 * 1000, true)).toBe('⏸ 24:31 Focus — Paradone')
  })

  it('labels the primer', () => {
    expect(sessionTitle('primer', 90 * 1000, false)).toBe('⏱ 01:30 Primer — Paradone')
  })

  it('labels the break', () => {
    expect(sessionTitle('break', 4 * 60 * 1000 + 12 * 1000, false)).toBe('⏱ 04:12 Break — Paradone')
  })

  it('falls back to the default title in every untimed state', () => {
    for (const state of ['setup', 'blockEnd', 'audit', 'summary']) {
      expect(sessionTitle(state, 0, false)).toBe(DEFAULT_TITLE)
    }
  })
})
