import { describe, it, expect } from 'vitest'
import {
  parseChecklist,
  toggleItem,
  addItem,
  removeItem,
  editItem,
  completedSince,
} from './checklist.js'

describe('parseChecklist', () => {
  it('parses an unchecked checkbox line', () => {
    const items = parseChecklist('- [ ] draft outline')
    expect(items[0]).toMatchObject({ line: '- [ ] draft outline', checkbox: true, checked: false })
  })

  it('parses a checked checkbox line', () => {
    const items = parseChecklist('- [x] send invoice')
    expect(items[0]).toMatchObject({ line: '- [x] send invoice', checkbox: true, checked: true })
  })

  it('passes a plain bullet/text line through untouched', () => {
    const items = parseChecklist('- ideas for post')
    expect(items[0]).toMatchObject({ line: '- ideas for post', checkbox: false, checked: false })
  })

  it('strips the checkbox marker into text, and leaves a plain line as-is', () => {
    const items = parseChecklist('- [x] send invoice\n- ideas for post')
    expect(items[0].text).toBe('send invoice')
    expect(items[1].text).toBe('- ideas for post')
  })

  it('gives the same line the same hash regardless of position', () => {
    const a = parseChecklist('- [ ] draft outline\n- ideas for post')
    const b = parseChecklist('- ideas for post\n- [ ] draft outline')
    expect(a[0].hash).toBe(b[1].hash)
  })
})

describe('toggleItem', () => {
  it('flips an unchecked line to checked', () => {
    const text = '- [ ] draft outline'
    const hash = parseChecklist(text)[0].hash
    expect(toggleItem(text, hash)).toBe('- [x] draft outline')
  })

  it('flips a checked line back to unchecked', () => {
    const text = '- [x] send invoice'
    const hash = parseChecklist(text)[0].hash
    expect(toggleItem(text, hash)).toBe('- [ ] send invoice')
  })

  it('only rewrites the matching line, leaving others untouched', () => {
    const text = '- [ ] draft outline\n- [x] send invoice\n- ideas for post'
    const hash = parseChecklist(text)[1].hash
    expect(toggleItem(text, hash)).toBe('- [ ] draft outline\n- [ ] send invoice\n- ideas for post')
  })

  it('keeps a checked state attached to the right line after hand-editing reorders the lines', () => {
    const original = '- [ ] draft outline\n- [x] send invoice\n- ideas for post'
    const outlineHash = parseChecklist(original)[0].hash

    const reordered = '- ideas for post\n- [x] send invoice\n- [ ] draft outline'
    expect(toggleItem(reordered, outlineHash)).toBe(
      '- ideas for post\n- [x] send invoice\n- [x] draft outline'
    )
  })

  it('returns the text unchanged when the hash is not found', () => {
    const text = '- [ ] draft outline'
    expect(toggleItem(text, 'nonexistent')).toBe(text)
  })
})

describe('addItem', () => {
  it('appends an unchecked task line to a non-empty list', () => {
    expect(addItem('- [ ] draft outline', 'send invoice')).toBe(
      '- [ ] draft outline\n- [ ] send invoice'
    )
  })

  it('yields just the one line when the list is empty (no leading blank line)', () => {
    expect(addItem('', 'draft outline')).toBe('- [ ] draft outline')
  })

  it('trims the task text', () => {
    expect(addItem('', '  draft outline  ')).toBe('- [ ] draft outline')
  })

  it('is a no-op when the task text is empty or whitespace', () => {
    expect(addItem('- [ ] draft outline', '   ')).toBe('- [ ] draft outline')
  })
})

describe('removeItem', () => {
  it('removes the matching line, leaving others untouched', () => {
    const text = '- [ ] draft outline\n- [x] send invoice\n- ideas for post'
    const hash = parseChecklist(text)[1].hash
    expect(removeItem(text, hash)).toBe('- [ ] draft outline\n- ideas for post')
  })

  it('empties the list when removing the only line', () => {
    const text = '- [ ] draft outline'
    const hash = parseChecklist(text)[0].hash
    expect(removeItem(text, hash)).toBe('')
  })

  it('returns the text unchanged when the hash is not found', () => {
    const text = '- [ ] draft outline'
    expect(removeItem(text, 'nonexistent')).toBe(text)
  })
})

describe('editItem', () => {
  it('replaces a checkbox line text while preserving its checked marker', () => {
    const text = '- [x] send invoice'
    const hash = parseChecklist(text)[0].hash
    expect(editItem(text, hash, 'send final invoice')).toBe('- [x] send final invoice')
  })

  it('preserves an unchecked marker', () => {
    const text = '- [ ] draft outline'
    const hash = parseChecklist(text)[0].hash
    expect(editItem(text, hash, 'draft full outline')).toBe('- [ ] draft full outline')
  })

  it('replaces a plain line whole', () => {
    const text = '- ideas for post'
    const hash = parseChecklist(text)[0].hash
    expect(editItem(text, hash, 'newer idea')).toBe('newer idea')
  })

  it('trims the new text and only rewrites the matching line', () => {
    const text = '- [ ] draft outline\n- [x] send invoice'
    const hash = parseChecklist(text)[0].hash
    expect(editItem(text, hash, '  reworked outline  ')).toBe(
      '- [ ] reworked outline\n- [x] send invoice'
    )
  })

  it('is a no-op when the hash is not found or the new text is empty', () => {
    const text = '- [ ] draft outline'
    const hash = parseChecklist(text)[0].hash
    expect(editItem(text, 'nonexistent', 'x')).toBe(text)
    expect(editItem(text, hash, '   ')).toBe(text)
  })
})

describe('completedSince', () => {
  it('reports a task that went from unchecked to checked', () => {
    expect(completedSince('- [ ] draft outline', '- [x] draft outline')).toEqual(['draft outline'])
  })

  it('reports a task added mid-session and checked', () => {
    expect(completedSince('- [ ] draft outline', '- [ ] draft outline\n- [x] send invoice')).toEqual(
      ['send invoice']
    )
  })

  it('ignores a task that was already checked at the start', () => {
    expect(completedSince('- [x] send invoice', '- [x] send invoice')).toEqual([])
  })

  it('ignores a task that went from checked to unchecked', () => {
    expect(completedSince('- [x] send invoice', '- [ ] send invoice')).toEqual([])
  })

  it('reports a task that was edited and then checked (the text is what identifies it)', () => {
    expect(completedSince('- [ ] draft outline', '- [x] draft full outline')).toEqual([
      'draft full outline',
    ])
  })

  it('is unaffected by reordering', () => {
    const start = '- [x] send invoice\n- [ ] draft outline'
    const end = '- [x] draft outline\n- [x] send invoice'
    expect(completedSince(start, end)).toEqual(['draft outline'])
  })

  it('reports every checked task when the start snapshot is empty', () => {
    expect(completedSince('', '- [x] draft outline\n- [ ] send invoice')).toEqual(['draft outline'])
  })

  it('returns an empty array when nothing changed', () => {
    const text = '- [ ] draft outline\n- [x] send invoice'
    expect(completedSince(text, text)).toEqual([])
  })

  it('never reports plain non-checkbox lines', () => {
    expect(completedSince('- [ ] draft outline', '- [x] draft outline\n- ideas for post')).toEqual([
      'draft outline',
    ])
  })
})
