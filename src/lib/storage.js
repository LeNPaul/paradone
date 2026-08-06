// storage.js — all localStorage read/write for paradone:prefs, paradone:goalsList,
// paradone:sessions, paradone:activeSession, paradone:archive. Nothing else
// touches storage directly.

const KEYS = {
  prefs: 'paradone:prefs',
  goalsList: 'paradone:goalsList',
  sessions: 'paradone:sessions',
  activeSession: 'paradone:activeSession',
  archive: 'paradone:archive',
}

function readJSON(key, fallback) {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback // corrupted JSON (e.g. manual devtools edit) — don't crash
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getPrefs() {
  return readJSON(KEYS.prefs, { workDuration: 25, breakDuration: 5 })
}
export function setPrefs(prefs) {
  writeJSON(KEYS.prefs, prefs)
}

export function getGoalsList() {
  return readJSON(KEYS.goalsList, { text: '', updatedAt: null })
}
export function setGoalsList(goalsList) {
  writeJSON(KEYS.goalsList, goalsList)
}

export function getSessions() {
  return readJSON(KEYS.sessions, [])
}
export function setSessions(sessions) {
  writeJSON(KEYS.sessions, sessions)
}

export function getActiveSession() {
  return readJSON(KEYS.activeSession, null)
}
export function setActiveSession(activeSession) {
  writeJSON(KEYS.activeSession, activeSession)
}

export function getArchive() {
  return readJSON(KEYS.archive, { completedAt: {}, archived: [] })
}
export function setArchive(archive) {
  writeJSON(KEYS.archive, archive)
}

// Targeted removes, not localStorage.clear(): the app may not be the only thing
// on this origin.
export function clearAll() {
  for (const key of Object.values(KEYS)) {
    localStorage.removeItem(key)
  }
}
