import { describe, it, expect, beforeEach } from 'vitest'
import { buildBackup, backupFilename, parseBackup, restoreBackup } from './backup.js'
import {
  getPrefs, setPrefs,
  getGoalsList, setGoalsList,
  getSessions, setSessions,
  getActiveSession, setActiveSession,
  getArchive, setArchive,
} from './storage.js'

const NOW = '2026-08-05T09:14:00.000Z'

const PREFS = { workDuration: 50, breakDuration: 10, theme: 'dark', addTaskKey: 'n', sound: false, notify: true }
const GOALS_LIST = { text: '- [ ] draft outline\n- [x] send invoice', updatedAt: NOW }
const SESSIONS = [{
  id: 'abc-123',
  date: '2026-08-05T08:15:00.000Z',
  auditedAt: '2026-08-05T08:45:00.000Z',
  taskListText: '- [ ] draft outline',
  completedTasks: ['send invoice'],
  plannedDuration: 25,
  actualDuration: 25,
  capture: 'reply to Mai re: weekend',
  usedPrimer: false,
  primerIntent: '',
  auditProductive: 'focused',
  auditNotes: 'tabbed out twice',
  completed: true,
}]
const ARCHIVE = {
  completedAt: { 'draft outline': '2026-08-01T09:14:00.000Z' },
  archived: [{
    id: 'def-456',
    text: 'book flights',
    completedAt: '2026-07-30T11:00:00.000Z',
    archivedAt: '2026-08-01T09:20:00.000Z',
  }],
}

function seedStorage() {
  setPrefs(PREFS)
  setGoalsList(GOALS_LIST)
  setSessions(SESSIONS)
  setArchive(ARCHIVE)
}

beforeEach(() => {
  localStorage.clear()
})

describe('buildBackup', () => {
  it('wraps every storage entity in a versioned envelope', () => {
    seedStorage()

    expect(buildBackup(NOW)).toEqual({
      format: 'paradone-backup',
      version: 1,
      exportedAt: NOW,
      data: {
        prefs: PREFS,
        goalsList: GOALS_LIST,
        sessions: SESSIONS,
        archive: ARCHIVE,
      },
    })
  })

  it('leaves the in-flight session out', () => {
    setActiveSession({ state: 'active', timer: { durationMs: 1500000 } })

    expect(buildBackup(NOW).data).not.toHaveProperty('activeSession')
  })

  it('falls back to storage defaults when nothing has been saved', () => {
    expect(buildBackup(NOW).data).toEqual({
      prefs: { workDuration: 25, breakDuration: 5, addTaskKey: 'n', sound: true, notify: false },
      goalsList: { text: '', updatedAt: null },
      sessions: [],
      archive: { completedAt: {}, archived: [] },
    })
  })
})

describe('backupFilename', () => {
  it('dates the file from the export time', () => {
    expect(backupFilename(NOW)).toBe('paradone-backup-2026-08-05.json')
  })
})

describe('round-trip', () => {
  it('restores every entity exactly after export, serialize, parse', () => {
    seedStorage()
    const file = JSON.stringify(buildBackup(NOW), null, 2)

    localStorage.clear()
    const result = parseBackup(file)
    expect(result.ok).toBe(true)
    restoreBackup(result.data)

    expect(getPrefs()).toEqual(PREFS)
    expect(getGoalsList()).toEqual(GOALS_LIST)
    expect(getSessions()).toEqual(SESSIONS)
    expect(getArchive()).toEqual(ARCHIVE)
  })
})

describe('restoreBackup', () => {
  it('clears an in-flight session so the app lands at setup', () => {
    setActiveSession({ state: 'active', timer: { durationMs: 1500000 } })

    restoreBackup({
      prefs: PREFS,
      goalsList: GOALS_LIST,
      sessions: SESSIONS,
      archive: ARCHIVE,
    })

    expect(getActiveSession()).toBeNull()
  })
})

describe('parseBackup', () => {
  it('rejects a file that is not JSON', () => {
    expect(parseBackup('{not valid json')).toEqual({
      ok: false,
      error: "That file isn't valid JSON.",
    })
  })

  it('rejects valid JSON that is not a backup', () => {
    expect(parseBackup('{"foo":1}').ok).toBe(false)
    expect(parseBackup('{"foo":1}').error).toBe("That doesn't look like a Paradone backup.")
  })

  it('rejects a JSON array', () => {
    expect(parseBackup('[]').ok).toBe(false)
  })

  it('rejects a backup from a newer version', () => {
    const file = JSON.stringify({ ...buildBackup(NOW), version: 2 })
    expect(parseBackup(file)).toEqual({
      ok: false,
      error: 'That backup was made by a newer version of Paradone.',
    })
  })

  it('rejects a backup with no data', () => {
    const file = JSON.stringify({ format: 'paradone-backup', version: 1 })
    expect(parseBackup(file)).toEqual({
      ok: false,
      error: 'That backup is missing or malformed data.',
    })
  })

  it('rejects a backup whose entities are the wrong type', () => {
    const backup = buildBackup(NOW)
    backup.data.sessions = { nope: true }
    expect(parseBackup(JSON.stringify(backup)).ok).toBe(false)
  })

  it('accepts a backup it built itself', () => {
    seedStorage()
    const result = parseBackup(JSON.stringify(buildBackup(NOW)))
    expect(result.ok).toBe(true)
    expect(result.data.sessions).toEqual(SESSIONS)
  })
})
