import { vi } from 'vitest'

// jsdom (v25) does not implement the native <dialog> modal methods that
// TaskModal drives, so provide no-op stubs for any test that mounts it.
HTMLDialogElement.prototype.showModal = vi.fn()
HTMLDialogElement.prototype.close = vi.fn()
