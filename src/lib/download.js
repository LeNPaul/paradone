// download.js — triggers a client-side file download. Kept out of the
// components so the markdown exports and the JSON backup share one
// implementation.

function download(text, type, filename) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadMarkdown(text, filename) {
  download(text, 'text/markdown', filename)
}

export function downloadJSON(text, filename) {
  download(text, 'application/json', filename)
}
