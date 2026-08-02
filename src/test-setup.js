import { vi } from 'vitest'

// jsdom (v25) does not implement the native <dialog> modal methods that
// TaskModal drives, so provide no-op stubs for any test that mounts it.
HTMLDialogElement.prototype.showModal = vi.fn()
HTMLDialogElement.prototype.close = vi.fn()

// jsdom has no matchMedia either, and useTheme reads it on first run. Default to
// light; tests that need the dark branch override `matches`.
window.matchMedia = vi.fn((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
