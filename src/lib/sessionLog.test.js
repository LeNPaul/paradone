import { describe, it, expect } from 'vitest'
import {
  buildLogMarkdown,
  formatDateTime,
  formatTime,
  productiveLabel,
  sortNewestFirst,
} from './sessionLog.js'

// Timestamps are formatted in the runner's local timezone, so assertions here
// stay structural rather than pinning an exact wall-clock string.
function session(overrides = {}) {
  return {
    id: 'a',
    date: '2026-08-01T13:50:00.000Z',
    auditedAt: '2026-08-01T14:15:00.000Z',
    taskListText: '- [x] draft outline',
    plannedDuration: 25,
    actualDuration: 25,
    capture: 'reply to Mai',
    usedPrimer: false,
    auditProductive: 'focused',
    auditNotes: 'got the outline done',
    completed: true,
    ...overrides,
  }
}

describe('formatDateTime / formatTime', () => {
  it('renders a date and a time for a full timestamp', () => {
    expect(formatDateTime('2026-08-01T14:15:00.000Z')).toMatch(/2026/)
    expect(formatDateTime('2026-08-01T14:15:00.000Z')).toMatch(/\d{1,2}:\d{2}/)
  })

  it('renders time only, without the date', () => {
    expect(formatTime('2026-08-01T14:15:00.000Z')).toMatch(/^\d{1,2}:\d{2}/)
    expect(formatTime('2026-08-01T14:15:00.000Z')).not.toMatch(/2026/)
  })

  it('does not throw on a missing timestamp', () => {
    expect(formatDateTime(null)).toBe('Unknown time')
    expect(formatTime(undefined)).toBe('Unknown time')
  })
})

describe('productiveLabel', () => {
  it('capitalises the known focus ratings', () => {
    expect(productiveLabel('focused')).toBe('Focused')
    expect(productiveLabel('distracted')).toBe('Distracted')
    expect(productiveLabel('mixed')).toBe('Mixed')
  })

  it('reports an empty rating as a skipped audit', () => {
    expect(productiveLabel('')).toBe('Audit skipped')
  })
})

describe('sortNewestFirst', () => {
  it('orders by auditedAt, newest first, without mutating the input', () => {
    const input = [
      session({ id: 'old', auditedAt: '2026-07-30T09:00:00.000Z' }),
      session({ id: 'new', auditedAt: '2026-08-01T14:15:00.000Z' }),
      session({ id: 'mid', auditedAt: '2026-07-31T16:40:00.000Z' }),
    ]
    expect(sortNewestFirst(input).map((s) => s.id)).toEqual(['new', 'mid', 'old'])
    expect(input.map((s) => s.id)).toEqual(['old', 'new', 'mid'])
  })

  it('falls back to the session start time for records written before auditedAt existed', () => {
    const legacy = { id: 'legacy', date: '2026-08-02T09:00:00.000Z' }
    const current = session({ id: 'current' })
    expect(sortNewestFirst([current, legacy]).map((s) => s.id)).toEqual(['legacy', 'current'])
  })
})

describe('buildLogMarkdown', () => {
  it('reports an empty log rather than an empty document', () => {
    const md = buildLogMarkdown([])
    expect(md).toContain('# Audit Log')
    expect(md).toContain('_No audits logged yet._')
  })

  it('renders every field of a single audit', () => {
    const md = buildLogMarkdown([session()])
    expect(md).toContain('- Started:')
    expect(md).toContain('· Audited:')
    expect(md).toContain('- Duration: 25 min planned / 25 min actual')
    expect(md).toContain('- Focus: Focused')
    expect(md).toContain('- What got done: got the outline done')
  })

  it('marks a skipped audit and omits its notes line', () => {
    const md = buildLogMarkdown([session({ auditProductive: '', auditNotes: '' })])
    expect(md).toContain('- Focus: _Audit skipped_')
    expect(md).not.toContain('What got done')
  })

  it('includes the 2-minute breakdown when the session used the primer, and omits the line otherwise', () => {
    expect(buildLogMarkdown([session({ primerIntent: 'open the doc' })])).toContain('- Primer: open the doc')
    expect(buildLogMarkdown([session()])).not.toContain('- Primer:')
  })

  it('lists the tasks completed during the session, and omits the line when none were', () => {
    const md = buildLogMarkdown([session({ completedTasks: ['draft outline', 'send invoice'] })])
    expect(md).toContain('- Completed: draft outline, send invoice')
    expect(buildLogMarkdown([session({ completedTasks: [] })])).not.toContain('- Completed:')
  })

  it('does not throw on a record written before completed-task tracking existed', () => {
    const md = buildLogMarkdown([session()])
    expect(md).not.toContain('- Completed:')
  })

  it('notes an answered audit that was left without notes', () => {
    const md = buildLogMarkdown([session({ auditNotes: '' })])
    expect(md).toContain('- What got done: _(none noted)_')
  })

  it('lists multiple audits newest first', () => {
    const md = buildLogMarkdown([
      session({ id: 'old', auditedAt: '2026-07-30T09:00:00.000Z', auditNotes: 'older note' }),
      session({ id: 'new', auditedAt: '2026-08-01T14:15:00.000Z', auditNotes: 'newer note' }),
    ])
    expect(md.indexOf('newer note')).toBeLessThan(md.indexOf('older note'))
  })

  it('does not throw on a legacy record with no auditedAt', () => {
    const md = buildLogMarkdown([{ id: 'legacy', date: '2026-08-02T09:00:00.000Z', plannedDuration: 25, actualDuration: 20, auditProductive: 'mixed', auditNotes: '' }])
    expect(md).toContain('- Duration: 25 min planned / 20 min actual')
    expect(md).not.toContain('Unknown time')
  })
})
