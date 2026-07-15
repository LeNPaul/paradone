import { describe, it, expect } from 'vitest'
import { parseChecklist, toggleItem } from './checklist.js'

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
