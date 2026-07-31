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
      checkbox: match !== null,
      checked: match !== null && match[1].toLowerCase() === 'x',
    }
  })
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

export function removeItem(text, hash) {
  const lines = text.split('\n')
  const idx = lines.findIndex((line) => hashLine(line) === hash)
  if (idx === -1) return text
  lines.splice(idx, 1)
  return lines.join('\n')
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
