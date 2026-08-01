// sessionLog.js — formats the append-only paradone:sessions array into the
// audit log: newest first, one entry per completed audit, exportable as
// markdown. Rendering and export share these helpers so the downloaded file
// matches what's on screen.

export const PRODUCTIVE_LABELS = { focused: 'Focused', distracted: 'Distracted', mixed: 'Mixed' }

const SKIPPED_LABEL = 'Audit skipped'

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export function formatDateTime(iso) {
  if (!iso) return 'Unknown time'
  return DATE_TIME_FORMAT.format(new Date(iso))
}

export function formatTime(iso) {
  if (!iso) return 'Unknown time'
  return TIME_FORMAT.format(new Date(iso))
}

export function productiveLabel(auditProductive) {
  // A skipped audit leaves auditProductive empty (the audit prompt requires a
  // value before it will submit), so empty means skipped rather than unknown.
  if (!auditProductive) return SKIPPED_LABEL
  return PRODUCTIVE_LABELS[auditProductive] ?? auditProductive
}

// Sessions written before the log existed have no auditedAt — fall back to the
// session start time so old records still sort sensibly instead of sinking.
function sortKey(session) {
  return new Date(session.auditedAt ?? session.date ?? 0).getTime()
}

export function sortNewestFirst(sessions) {
  return [...sessions].sort((a, b) => sortKey(b) - sortKey(a))
}

function entryMarkdown(session) {
  const lines = [
    `## ${formatDateTime(session.auditedAt ?? session.date)}`,
    `- Started: ${formatTime(session.date)} · Audited: ${formatTime(session.auditedAt ?? session.date)}`,
    `- Duration: ${session.plannedDuration} min planned / ${session.actualDuration} min actual`,
    `- Focus: ${session.auditProductive ? productiveLabel(session.auditProductive) : `_${SKIPPED_LABEL}_`}`,
  ]
  if (session.primerIntent) {
    lines.push(`- Primer: ${session.primerIntent}`)
  }
  if (session.auditProductive) {
    lines.push(`- What got done: ${session.auditNotes || '_(none noted)_'}`)
  }
  return lines.join('\n')
}

export function buildLogMarkdown(sessions) {
  const body = sessions.length
    ? sortNewestFirst(sessions).map(entryMarkdown).join('\n\n')
    : '_No audits logged yet._'
  return `# Audit Log\n\n${body}\n`
}
