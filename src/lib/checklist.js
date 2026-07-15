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
