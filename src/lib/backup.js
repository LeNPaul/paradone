// backup.js — the whole-app JSON backup: build one file from every storage
// entity, validate one back, and restore it. Goes through storage.js like
// everything else; nothing here touches localStorage directly.
//
// The in-flight session is deliberately left out. Its timer holds wall-clock
// timestamps, so a restored one would either be long expired or silently wrong
// — restoring drops it instead and lands the user back at Setup.

import {
  getPrefs, setPrefs,
  getGoalsList, setGoalsList,
  getSessions, setSessions,
  setActiveSession,
  getArchive, setArchive,
} from './storage.js'

const FORMAT = 'paradone-backup'
const VERSION = 1

export function buildBackup(nowIso) {
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: nowIso,
    data: {
      prefs: getPrefs(),
      goalsList: getGoalsList(),
      sessions: getSessions(),
      archive: getArchive(),
    },
  }
}

export function backupFilename(nowIso) {
  return `paradone-backup-${nowIso.slice(0, 10)}.json`
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Picking the wrong file is an ordinary mistake, not an impossible one, so the
// failure is a message the panel can show rather than a thrown error. Checks
// are type-level only — the shape inside a session record is not policed.
export function parseBackup(text) {
  let backup
  try {
    backup = JSON.parse(text)
  } catch {
    return { ok: false, error: "That file isn't valid JSON." }
  }

  if (!isObject(backup) || backup.format !== FORMAT) {
    return { ok: false, error: "That doesn't look like a Paradone backup." }
  }
  if (backup.version !== VERSION) {
    return { ok: false, error: 'That backup was made by a newer version of Paradone.' }
  }

  const data = backup.data
  const valid =
    isObject(data) &&
    isObject(data.prefs) &&
    isObject(data.goalsList) &&
    Array.isArray(data.sessions) &&
    isObject(data.archive)
  if (!valid) {
    return { ok: false, error: 'That backup is missing or malformed data.' }
  }

  return { ok: true, data }
}

export function restoreBackup(data) {
  setPrefs(data.prefs)
  setGoalsList(data.goalsList)
  setSessions(data.sessions)
  setArchive(data.archive)
  setActiveSession(null)
}
