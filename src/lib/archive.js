// archive.js — moves checked tasks off the Task List into a persistent record,
// keeping the time each one was actually ticked. The Task List markdown string
// carries no per-task metadata, so tick times live in a side map keyed on the
// marker-stripped task text — the same identity completedSince() uses.

import { parseChecklist, removeChecked, completedSince } from './checklist.js'
import { formatDateTime } from './sessionLog.js'

// Rebuild the tick-time map for a Task List write. Entries whose task is no
// longer checked (unticked, deleted, or renamed) fall out, which is what keeps
// the map from accumulating orphans.
//
// New times are stamped only for tasks that *became* checked in this write, not
// for everything currently checked — otherwise the first unrelated edit would
// stamp tasks checked before this feature shipped with a false "now". Those
// stay out of the map and fall back to archivedAt when archived.
export function syncCompletions(completedAt, prevText, nextText, nowIso) {
  const stillChecked = new Set(
    parseChecklist(nextText)
      .filter((item) => item.checkbox && item.checked)
      .map((item) => item.text),
  )
  const next = {}
  for (const [text, iso] of Object.entries(completedAt)) {
    if (stillChecked.has(text)) next[text] = iso
  }
  for (const text of completedSince(prevText, nextText)) {
    next[text] = nowIso
  }
  return next
}

// Sweep every checked task off the list into the archive. Returns the new Task
// List text alongside the new archive so the caller persists both together.
export function archiveChecked(taskListText, archive, nowIso) {
  const { text, removed } = removeChecked(taskListText)
  const entries = removed.map((taskText) => ({
    id: crypto.randomUUID(),
    text: taskText,
    completedAt: archive.completedAt[taskText] ?? nowIso,
    archivedAt: nowIso,
  }))
  return {
    taskListText: text,
    archive: {
      completedAt: syncCompletions(archive.completedAt, taskListText, text, nowIso),
      archived: [...archive.archived, ...entries],
    },
  }
}

export function sortNewestFirst(entries) {
  return [...entries].sort(
    (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
  )
}

export function buildArchiveMarkdown(entries) {
  const body = entries.length
    ? sortNewestFirst(entries)
        .map((entry) => `- ${entry.text} — completed ${formatDateTime(entry.completedAt)}`)
        .join('\n')
    : '_No tasks archived yet._'
  return `# Archived Tasks\n\n${body}\n`
}
