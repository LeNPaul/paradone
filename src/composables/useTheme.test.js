import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reactive, nextTick } from 'vue'
import { useTheme } from './useTheme.js'

function systemPrefersDark(dark) {
  window.matchMedia = vi.fn((query) => ({ matches: dark, media: query }))
}

beforeEach(() => {
  delete document.documentElement.dataset.theme
  systemPrefersDark(false)
})

describe('seeding from the OS', () => {
  it('persists dark when nothing is stored and the OS prefers dark', () => {
    systemPrefersDark(true)
    const prefs = reactive({ workDuration: 25, breakDuration: 5 })
    const updatePrefs = vi.fn((next) => Object.assign(prefs, next))

    useTheme(prefs, updatePrefs)

    expect(updatePrefs).toHaveBeenCalledWith({ theme: 'dark' })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('persists light when nothing is stored and the OS prefers light', () => {
    const prefs = reactive({ workDuration: 25, breakDuration: 5 })
    const updatePrefs = vi.fn((next) => Object.assign(prefs, next))

    useTheme(prefs, updatePrefs)

    expect(updatePrefs).toHaveBeenCalledWith({ theme: 'light' })
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('replaces a garbage stored value rather than stamping it', () => {
    const prefs = reactive({ workDuration: 25, breakDuration: 5, theme: 'chartreuse' })
    const updatePrefs = vi.fn((next) => Object.assign(prefs, next))

    useTheme(prefs, updatePrefs)

    expect(updatePrefs).toHaveBeenCalledWith({ theme: 'light' })
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('applying a stored choice', () => {
  it('keeps the stored theme even when the OS disagrees, and does not re-persist', () => {
    systemPrefersDark(false)
    const prefs = reactive({ workDuration: 25, breakDuration: 5, theme: 'dark' })
    const updatePrefs = vi.fn()

    useTheme(prefs, updatePrefs)

    expect(updatePrefs).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('restamps <html> when the theme pref changes', async () => {
    const prefs = reactive({ workDuration: 25, breakDuration: 5, theme: 'light' })
    useTheme(prefs, vi.fn())
    expect(document.documentElement.dataset.theme).toBe('light')

    prefs.theme = 'dark'
    await nextTick()

    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
