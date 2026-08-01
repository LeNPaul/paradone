import { describe, it, expect, beforeEach, vi } from 'vitest'
import { downloadMarkdown } from './download.js'

beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

describe('downloadMarkdown', () => {
  it('creates a blob URL, clicks an anchor, and revokes the URL', () => {
    downloadMarkdown('# Audit Log', 'paradone-audit-log.md')

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('names the downloaded file with the given filename', () => {
    const created = vi.spyOn(document, 'createElement')
    downloadMarkdown('# Audit Log', 'paradone-audit-log.md')

    const link = created.mock.results.find((r) => r.value instanceof HTMLAnchorElement).value
    expect(link.download).toBe('paradone-audit-log.md')
  })

  it('writes the given text into the blob', async () => {
    downloadMarkdown('# Audit Log\n\nbody', 'paradone-audit-log.md')

    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/markdown')
    // jsdom's Blob has no .text(), so read it the long way round.
    const contents = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsText(blob)
    })
    expect(contents).toBe('# Audit Log\n\nbody')
  })
})
