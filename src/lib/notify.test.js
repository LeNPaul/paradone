import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { notificationPermission, requestNotificationPermission, showNotification } from './notify.js'

let constructed

function stubNotification(permission) {
  constructed = []
  class FakeNotification {
    constructor(title, options) {
      this.title = title
      this.options = options
      constructed.push(this)
    }
  }
  FakeNotification.permission = permission
  FakeNotification.requestPermission = vi.fn(async () => permission)
  window.Notification = FakeNotification
  return FakeNotification
}

beforeEach(() => {
  constructed = []
})

afterEach(() => {
  delete window.Notification
})

describe('notificationPermission', () => {
  it.each(['granted', 'denied', 'default'])('reports %s straight from the browser', (permission) => {
    stubNotification(permission)
    expect(notificationPermission()).toBe(permission)
  })

  it('reports unsupported where the API is absent', () => {
    expect(notificationPermission()).toBe('unsupported')
  })
})

describe('requestNotificationPermission', () => {
  it('resolves to what the browser answered', async () => {
    stubNotification('granted')
    await expect(requestNotificationPermission()).resolves.toBe('granted')
  })

  it('resolves to unsupported without throwing where the API is absent', async () => {
    await expect(requestNotificationPermission()).resolves.toBe('unsupported')
  })
})

describe('showNotification', () => {
  it('raises a tagged notification when permission is granted', () => {
    stubNotification('granted')

    showNotification('Block complete', 'Take a break, keep going, or wrap up?')

    expect(constructed).toHaveLength(1)
    expect(constructed[0].title).toBe('Block complete')
    expect(constructed[0].options.body).toBe('Take a break, keep going, or wrap up?')
    expect(constructed[0].options.tag).toBe('paradone-block-end')
  })

  // One tag for every block end, so a second block replaces the first popup
  // rather than stacking another unread one behind it.
  it('reuses the same tag across blocks', () => {
    stubNotification('granted')

    showNotification('Block complete', 'first')
    showNotification('Break complete', 'second')

    expect(constructed[0].options.tag).toBe(constructed[1].options.tag)
  })

  it('focuses the window when the notification is clicked', () => {
    stubNotification('granted')
    const focus = vi.spyOn(window, 'focus').mockImplementation(() => {})

    showNotification('Block complete', 'body')
    constructed[0].onclick()

    expect(focus).toHaveBeenCalled()
    focus.mockRestore()
  })

  it.each(['denied', 'default'])('raises nothing when permission is %s', (permission) => {
    stubNotification(permission)
    showNotification('Block complete', 'body')
    expect(constructed).toHaveLength(0)
  })

  it('is a no-op where the API is absent', () => {
    expect(() => showNotification('Block complete', 'body')).not.toThrow()
  })
})
