import { describe, it, expect } from 'vitest'
import { syncCompletions, archiveChecked, sortNewestFirst, buildArchiveMarkdown } from './archive.js'

const NOW = '2026-08-01T09:14:00.000Z'
const EARLIER = '2026-07-30T11:00:00.000Z'

describe('syncCompletions', () => {
  it('stamps a task that just went from unchecked to checked', () => {
    expect(syncCompletions({}, '- [ ] draft outline', '- [x] draft outline', NOW)).toEqual({
      'draft outline': NOW,
    })
  })

  it('drops the entry when a task is unticked', () => {
    const map = { 'send invoice': EARLIER }
    expect(syncCompletions(map, '- [x] send invoice', '- [ ] send invoice', NOW)).toEqual({})
  })

  it('drops the entry when a checked task is deleted', () => {
    const map = { 'send invoice': EARLIER }
    expect(syncCompletions(map, '- [x] send invoice', '', NOW)).toEqual({})
  })

  it('drops the orphan when a checked task is renamed', () => {
    const map = { 'send invoice': EARLIER }
    const next = syncCompletions(map, '- [x] send invoice', '- [x] send final invoice', NOW)
    expect(next).toEqual({ 'send final invoice': NOW })
  })

  it('preserves an existing tick time across an unrelated edit', () => {
    const map = { 'send invoice': EARLIER }
    const next = syncCompletions(
      map,
      '- [x] send invoice',
      '- [x] send invoice\n- [ ] draft outline',
      NOW,
    )
    expect(next).toEqual({ 'send invoice': EARLIER })
  })

  // Tasks checked before this feature existed have no entry. An unrelated edit
  // must not invent one, or the archive would claim they were done just now.
  it('does not stamp a task that was already checked before the write', () => {
    const next = syncCompletions(
      {},
      '- [x] send invoice',
      '- [x] send invoice\n- [ ] draft outline',
      NOW,
    )
    expect(next).toEqual({})
  })

  it('ignores plain non-checkbox lines', () => {
    expect(syncCompletions({}, '', '- ideas for post', NOW)).toEqual({})
  })
})

describe('archiveChecked', () => {
  const archive = { completedAt: { 'send invoice': EARLIER }, archived: [] }

  it('moves checked tasks off the list, carrying their real tick time', () => {
    const result = archiveChecked('- [ ] draft outline\n- [x] send invoice', archive, NOW)
    expect(result.taskListText).toBe('- [ ] draft outline')
    expect(result.archive.archived).toHaveLength(1)
    expect(result.archive.archived[0]).toMatchObject({
      text: 'send invoice',
      completedAt: EARLIER,
      archivedAt: NOW,
    })
  })

  it('falls back to the archive time when no tick time was recorded', () => {
    const result = archiveChecked('- [x] book flights', { completedAt: {}, archived: [] }, NOW)
    expect(result.archive.archived[0]).toMatchObject({ completedAt: NOW, archivedAt: NOW })
  })

  it('prunes the archived tasks out of the tick-time map', () => {
    const result = archiveChecked('- [x] send invoice', archive, NOW)
    expect(result.archive.completedAt).toEqual({})
  })

  it('leaves unchecked and plain lines alone', () => {
    const result = archiveChecked('- [ ] draft outline\n- ideas for post', archive, NOW)
    expect(result.taskListText).toBe('- [ ] draft outline\n- ideas for post')
    expect(result.archive.archived).toEqual([])
  })

  it('appends to existing archive entries rather than replacing them', () => {
    const existing = {
      completedAt: {},
      archived: [{ id: 'old', text: 'book flights', completedAt: EARLIER, archivedAt: EARLIER }],
    }
    const result = archiveChecked('- [x] send invoice', existing, NOW)
    expect(result.archive.archived.map((e) => e.text)).toEqual(['book flights', 'send invoice'])
  })

  it('gives each entry a unique id', () => {
    const result = archiveChecked('- [x] send invoice\n- [x] book flights', archive, NOW)
    const [a, b] = result.archive.archived
    expect(a.id).toBeTruthy()
    expect(a.id).not.toBe(b.id)
  })
})

describe('sortNewestFirst', () => {
  it('orders entries by archive time, newest first', () => {
    const entries = [
      { id: 'a', archivedAt: EARLIER },
      { id: 'b', archivedAt: NOW },
    ]
    expect(sortNewestFirst(entries).map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the input', () => {
    const entries = [{ id: 'a', archivedAt: EARLIER }, { id: 'b', archivedAt: NOW }]
    sortNewestFirst(entries)
    expect(entries.map((e) => e.id)).toEqual(['a', 'b'])
  })
})

describe('buildArchiveMarkdown', () => {
  it('lists entries newest first with their completion time', () => {
    const md = buildArchiveMarkdown([
      { id: 'a', text: 'book flights', completedAt: EARLIER, archivedAt: EARLIER },
      { id: 'b', text: 'send invoice', completedAt: NOW, archivedAt: NOW },
    ])
    expect(md).toContain('# Archived Tasks')
    expect(md.indexOf('send invoice')).toBeLessThan(md.indexOf('book flights'))
    expect(md).toMatch(/- send invoice — completed .+/)
  })

  it('says so when the archive is empty', () => {
    expect(buildArchiveMarkdown([])).toContain('_No tasks archived yet._')
  })
})
