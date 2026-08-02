import { describe, it, expect } from 'vitest'
import { buildSummaryMarkdown } from './summary.js'

const baseInput = {
  taskListText: '- [x] draft outline\n- [ ] send invoice',
  completedTasks: ['draft outline'],
  capture: 'reply to Mai re: weekend',
  auditProductive: 'focused',
  auditNotes: 'got the outline done',
}

describe('buildSummaryMarkdown', () => {
  it('builds the whole document for an answered audit', () => {
    expect(buildSummaryMarkdown(baseInput)).toBe(`# Session Summary

## Tasks
- [x] draft outline
- [ ] send invoice

## Completed this session
- draft outline

## Captures
reply to Mai re: weekend

## Audit
- **Focus:** Focused
- **What actually got done:** got the outline done
`)
  })

  it('lists every completed task as its own bullet', () => {
    const markdown = buildSummaryMarkdown({
      ...baseInput,
      completedTasks: ['draft outline', 'send invoice'],
    })
    expect(markdown).toContain('## Completed this session\n- draft outline\n- send invoice')
  })

  it('omits the entire Audit section when the audit was skipped', () => {
    const markdown = buildSummaryMarkdown({ ...baseInput, auditProductive: '', auditNotes: '' })
    expect(markdown).not.toContain('## Audit')
    expect(markdown).not.toContain('Focus:')
  })

  it('falls back to italic placeholders for an empty capture, no completions, and no notes', () => {
    const markdown = buildSummaryMarkdown({
      ...baseInput,
      completedTasks: [],
      capture: '   ',
      auditNotes: '',
    })
    expect(markdown).toContain('## Completed this session\n_No tasks checked off this session._')
    expect(markdown).toContain('## Captures\n_No captures recorded._')
    expect(markdown).toContain('- **What actually got done:** _(none noted)_')
  })
})
