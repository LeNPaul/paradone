// checklist.js — markdown parse, content-hash keying, toggle-rewrite.
// Source of truth is the raw markdown string; item identity keys on a content
// hash of the line, never on line index.

const CHECKBOX_RE = /^- \[([ xX])\] ?(.*)$/

function hashLine(line) {
  let hash = 2166136261
  for (let i = 0; i < line.length; i++) {
    hash ^= line.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

export function parseChecklist(text) {
  return text.split('\n').map((line) => {
    const match = line.match(CHECKBOX_RE)
    return {
      hash: hashLine(line),
      line,
      text: match ? match[2] : line,
      checkbox: match !== null,
      checked: match !== null && match[1].toLowerCase() === 'x',
    }
  })
}

// A task counts as completed for a block if it's checked at the end and wasn't
// checked at the start — including tasks added mid-session. Identity is the
// marker-stripped text, not the hash: hashLine covers the whole line, so a
// toggle changes an item's hash.
export function completedSince(startText, endText) {
  const checkedAtStart = new Set(
    parseChecklist(startText)
      .filter((item) => item.checkbox && item.checked)
      .map((item) => item.text),
  )
  return parseChecklist(endText)
    .filter((item) => item.checkbox && item.checked && !checkedAtStart.has(item.text))
    .map((item) => item.text)
}

// Tasks on the list now that weren't on it when the block started. Identity is
// the marker-stripped text, not the hash, for the same reason completedSince
// uses it: hashLine covers the whole line, so a toggle changes an item's hash.
// A task counts as pre-existing whether it was checked or unchecked at the start.
export function addedSince(startText, endText) {
  const atStart = new Set(
    parseChecklist(startText)
      .filter((item) => item.checkbox)
      .map((item) => item.text),
  )
  return parseChecklist(endText)
    .filter((item) => item.checkbox && !atStart.has(item.text))
    .map((item) => item.text)
}

export function toggleItem(text, hash) {
  const lines = text.split('\n')
  const idx = lines.findIndex((line) => hashLine(line) === hash)
  if (idx === -1) return text
  const match = lines[idx].match(CHECKBOX_RE)
  if (!match) return text
  const flipped = match[1].toLowerCase() === 'x' ? ' ' : 'x'
  lines[idx] = `- [${flipped}] ${match[2]}`
  return lines.join('\n')
}

// Append a new unchecked task line. Empty input is a no-op; an empty list
// yields just the one line, so we never introduce a leading blank line.
export function addItem(text, taskText) {
  const trimmed = taskText.trim()
  if (trimmed === '') return text
  const line = `- [ ] ${trimmed}`
  return text === '' ? line : `${text}\n${line}`
}

// Append a task that's already done — the Audit screen's "type what you did"
// entry, where recording the work and ticking it off are one gesture.
export function addDoneItem(text, taskText) {
  const trimmed = taskText.trim()
  if (trimmed === '') return text
  const line = `- [x] ${trimmed}`
  return text === '' ? line : `${text}\n${line}`
}

export function removeItem(text, hash) {
  const lines = text.split('\n')
  const idx = lines.findIndex((line) => hashLine(line) === hash)
  if (idx === -1) return text
  lines.splice(idx, 1)
  return lines.join('\n')
}

// Drop every checked line, returning the remaining markdown plus the
// marker-stripped text of what was dropped. Unchecked and plain lines pass
// through untouched.
export function removeChecked(text) {
  const items = text === '' ? [] : parseChecklist(text)
  const kept = items.filter((item) => !(item.checkbox && item.checked))
  const removed = items.filter((item) => item.checkbox && item.checked)
  return {
    text: kept.map((item) => item.line).join('\n'),
    removed: removed.map((item) => item.text),
  }
}

// Tick the named tasks, keyed on marker-stripped text for the same reason
// completedSince is: the hash covers the whole line, so it changes on toggle.
// Already-checked, unnamed, and plain lines pass through untouched.
export function markChecked(text, taskTexts) {
  const wanted = new Set(taskTexts)
  return text
    .split('\n')
    .map((line) => {
      const match = line.match(CHECKBOX_RE)
      if (!match || match[1].toLowerCase() === 'x' || !wanted.has(match[2])) return line
      return `- [x] ${match[2]}`
    })
    .join('\n')
}

// Replace a line's text by hash. Checkbox lines keep their marker (and thus
// their checked state); plain lines are replaced whole. Empty input is a no-op.
export function editItem(text, hash, newText) {
  const trimmed = newText.trim()
  if (trimmed === '') return text
  const lines = text.split('\n')
  const idx = lines.findIndex((line) => hashLine(line) === hash)
  if (idx === -1) return text
  const match = lines[idx].match(CHECKBOX_RE)
  lines[idx] = match ? `- [${match[1]}] ${trimmed}` : trimmed
  return lines.join('\n')
}
