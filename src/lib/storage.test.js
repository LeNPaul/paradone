import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPrefs, setPrefs,
  getGoalsList, setGoalsList,
  getSessions, setSessions,
  getActiveSession, setActiveSession,
} from './storage.js'

beforeEach(() => {
  localStorage.clear()
})

describe('prefs', () => {
  it('returns defaults when unset', () => {
    expect(getPrefs()).toEqual({ workDuration: 25, breakDuration: 5 })
  })

  it('round-trips a write', () => {
    const prefs = { workDuration: 50, breakDuration: 10 }
    setPrefs(prefs)
    expect(getPrefs()).toEqual(prefs)
  })

  it('falls back to defaults on malformed JSON', () => {
    localStorage.setItem('paradone:prefs', '{not valid json')
    expect(getPrefs()).toEqual({ workDuration: 25, breakDuration: 5 })
  })
})

describe('goalsList', () => {
  it('returns default when unset', () => {
    expect(getGoalsList()).toEqual({ text: '', updatedAt: null })
  })

  it('round-trips a write', () => {
    const goalsList = {
      text: '- [ ] draft outline\n- [x] send invoice\n- ideas for post',
      updatedAt: '2026-07-13T09:00:00Z',
    }
    setGoalsList(goalsList)
    expect(getGoalsList()).toEqual(goalsList)
  })
})

describe('sessions', () => {
  it('returns empty array when unset', () => {
    expect(getSessions()).toEqual([])
  })

  it('round-trips a write', () => {
    const sessions = [{
      id: 'abc-123',
      date: '2026-07-13T09:15:00Z',
      sessionGoalText: '- [ ] draft outline',
      plannedDuration: 25,
      actualDuration: 25,
      captures: [{ text: 'reply to Mai re: weekend', timestamp: '2026-07-13T09:20:00Z' }],
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got the outline done, tabbed out twice',
    }]
    setSessions(sessions)
    expect(getSessions()).toEqual(sessions)
  })
})

describe('activeSession', () => {
  it('returns null when unset', () => {
    expect(getActiveSession()).toBeNull()
  })

  it('round-trips a write', () => {
    const activeSession = { startedAt: '2026-07-13T09:15:00Z', plannedDuration: 25 }
    setActiveSession(activeSession)
    expect(getActiveSession()).toEqual(activeSession)
  })

  it('round-trips clearing back to null', () => {
    setActiveSession({ startedAt: '2026-07-13T09:15:00Z' })
    setActiveSession(null)
    expect(getActiveSession()).toBeNull()
  })
})
