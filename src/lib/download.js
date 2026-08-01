// download.js — triggers a client-side file download. Kept out of the
// components so both the per-session export and the audit-log export share
// one implementation.

export function downloadMarkdown(text, filename) {
  const blob = new Blob([text], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
