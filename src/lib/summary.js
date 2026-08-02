// summary.js — the session summary export. The Summary screen renders this same
// data as markup; this module is the only place the markdown wire format lives,
// so Copy and Download stay identical to each other and stable across restyles.

import { PRODUCTIVE_LABELS } from './sessionLog.js'

export function buildSummaryMarkdown({
  taskListText = '',
  completedTasks = [],
  capture = '',
  auditProductive = '',
  auditNotes = '',
}) {
  const captureText = capture.trim() || '_No captures recorded._'

  const completedText = completedTasks.length
    ? completedTasks.map((task) => `- ${task}`).join('\n')
    : '_No tasks checked off this session._'

  // A skipped audit leaves auditProductive empty; a submitted one always has a
  // Focus value (the audit prompt requires one), so empty here means skipped —
  // in which case the whole Audit section is omitted.
  const productiveLabel = PRODUCTIVE_LABELS[auditProductive] ?? auditProductive
  const auditSection = auditProductive
    ? `

## Audit
- **Focus:** ${productiveLabel}
- **What actually got done:** ${auditNotes || '_(none noted)_'}`
    : ''

  return `# Session Summary

## Tasks
${taskListText}

## Completed this session
${completedText}

## Captures
${captureText}${auditSection}
`
}
