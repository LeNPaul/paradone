import { describe, it, expect } from 'vitest'
import { buildSummaryMarkdown } from './summary.js'

const baseInput = {
  focusedMs: 75 * 60 * 1000,
  completedTasks: ['draft outline'],
  capture: 'reply to Mai re: weekend',
  auditProductive: 'focused',
  auditNotes: 'got the outline done',
}

describe('buildSummaryMarkdown', () => {
  it('builds the whole document for an answered audit', () => {
    expect(buildSummaryMarkdown(baseInput)).toBe(`# Session Summary

**Focused time:** 1h 15m

## Completed this session
- draft outline

## Captures
reply to Mai re: weekend

## Audit
- **Focus:** Focused
- **Notes:** got the outline done
`)
  })

  it('reports the focused time, falling back to zero when none is given', () => {
    expect(buildSummaryMarkdown({ ...baseInput, focusedMs: 45 * 60 * 1000 })).toContain(
      '**Focused time:** 45m',
    )
    const { focusedMs, ...withoutDuration } = baseInput
    expect(buildSummaryMarkdown(withoutDuration)).toContain('**Focused time:** 0m')
  })

  it('lists every completed task as its own bullet', () => {
    const markdown = buildSummaryMarkdown({
      ...baseInput,
      completedTasks: ['draft outline', 'send invoice'],
    })
    expect(markdown).toContain('## Completed this session\n- draft outline\n- send invoice')
  })

  it('annotates the tasks that were added mid-session, in place', () => {
    const markdown = buildSummaryMarkdown({
      ...baseInput,
      completedTasks: ['draft outline', 'reply to Mai'],
      addedTasks: ['reply to Mai'],
    })
    expect(markdown).toContain(
      '## Completed this session\n- draft outline\n- reply to Mai (added mid-session)',
    )
  })

  it('annotates nothing when no addedTasks are given', () => {
    const markdown = buildSummaryMarkdown({
      ...baseInput,
      completedTasks: ['draft outline', 'reply to Mai'],
    })
    expect(markdown).not.toContain('(added mid-session)')
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
    expect(markdown).toContain('- **Notes:** _(none noted)_')
  })
})
