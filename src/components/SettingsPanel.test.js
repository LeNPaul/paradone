import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SettingsPanel from './SettingsPanel.vue'

describe('rendering', () => {
  it('renders the current prefs into the inputs', () => {
    const wrapper = mount(SettingsPanel, { props: { prefs: { workDuration: 25, breakDuration: 5 } } })
    expect(wrapper.get('#work-duration').element.value).toBe('25')
    expect(wrapper.get('#break-duration').element.value).toBe('5')
  })
})

describe('editing', () => {
  it('emits update with the merged prefs when work duration changes', async () => {
    const wrapper = mount(SettingsPanel, { props: { prefs: { workDuration: 25, breakDuration: 5 } } })
    const input = wrapper.get('#work-duration')
    await input.setValue(40)
    await input.trigger('change')
    expect(wrapper.emitted('update')[0]).toEqual([{ workDuration: 40, breakDuration: 5 }])
  })

  it('emits update with the merged prefs when break duration changes to 0 (no breaks)', async () => {
    const wrapper = mount(SettingsPanel, { props: { prefs: { workDuration: 25, breakDuration: 5 } } })
    const input = wrapper.get('#break-duration')
    await input.setValue(0)
    await input.trigger('change')
    expect(wrapper.emitted('update')[0]).toEqual([{ workDuration: 25, breakDuration: 0 }])
  })

  it('clamps work duration below 1 up to 1', async () => {
    const wrapper = mount(SettingsPanel, { props: { prefs: { workDuration: 25, breakDuration: 5 } } })
    const input = wrapper.get('#work-duration')
    await input.setValue(-3)
    await input.trigger('change')
    expect(wrapper.emitted('update')[0]).toEqual([{ workDuration: 1, breakDuration: 5 }])
  })

  it('falls back to the previous value for non-numeric input', async () => {
    const wrapper = mount(SettingsPanel, { props: { prefs: { workDuration: 25, breakDuration: 5 } } })
    const input = wrapper.get('#work-duration')
    await input.setValue('')
    await input.trigger('change')
    expect(wrapper.emitted('update')[0]).toEqual([{ workDuration: 25, breakDuration: 5 }])
  })

  it('updates the displayed inputs when the prefs prop changes', async () => {
    const wrapper = mount(SettingsPanel, { props: { prefs: { workDuration: 25, breakDuration: 5 } } })
    await wrapper.setProps({ prefs: { workDuration: 50, breakDuration: 10 } })
    expect(wrapper.get('#work-duration').element.value).toBe('50')
    expect(wrapper.get('#break-duration').element.value).toBe('10')
  })
})

describe('the add-task shortcut key', () => {
  const prefs = { workDuration: 25, breakDuration: 5, addTaskKey: 'n' }

  function mountPanel(overrides = {}) {
    return mount(SettingsPanel, { props: { prefs: { ...prefs, ...overrides } } })
  }

  async function setKey(wrapper, value) {
    const input = wrapper.get('#add-task-key')
    await input.setValue(value)
    await input.trigger('change')
    return input
  }

  it('renders the current key', () => {
    expect(mountPanel().get('#add-task-key').element.value).toBe('n')
  })

  it('emits only the key, leaving the durations out of the payload', async () => {
    const wrapper = mountPanel()
    await setKey(wrapper, 't')
    expect(wrapper.emitted('update')[0]).toEqual([{ addTaskKey: 't' }])
  })

  it('lowercases the key', async () => {
    const wrapper = mountPanel()
    const input = await setKey(wrapper, 'T')
    expect(wrapper.emitted('update')[0]).toEqual([{ addTaskKey: 't' }])
    expect(input.element.value).toBe('t')
  })

  // Blank is how the shortcut gets turned off, so it has to be emitted, not
  // treated as a non-answer the way an empty duration is.
  it('emits a blank key to disable the shortcut', async () => {
    const wrapper = mountPanel()
    await setKey(wrapper, '')
    expect(wrapper.emitted('update')[0]).toEqual([{ addTaskKey: '' }])
  })

  it.each(['5', '?'])('reverts %s to the previous key', async (value) => {
    const wrapper = mountPanel()
    const input = await setKey(wrapper, value)
    expect(wrapper.emitted('update')[0]).toEqual([{ addTaskKey: 'n' }])
    expect(input.element.value).toBe('n')
  })

  it('updates the displayed key when the prefs prop changes', async () => {
    const wrapper = mountPanel()
    await wrapper.setProps({ prefs: { ...prefs, addTaskKey: 'q' } })
    expect(wrapper.get('#add-task-key').element.value).toBe('q')
  })
})

describe('the block-end alerts', () => {
  const prefs = { workDuration: 25, breakDuration: 5, addTaskKey: 'n', sound: true, notify: false }

  // jsdom has no Notification API, so without a stub every case would render
  // the unsupported branch.
  function stubNotification(permission, answer = permission) {
    class FakeNotification {}
    FakeNotification.permission = permission
    FakeNotification.requestPermission = vi.fn(async () => answer)
    window.Notification = FakeNotification
    return FakeNotification
  }

  function mountPanel(overrides = {}) {
    return mount(SettingsPanel, { props: { prefs: { ...prefs, ...overrides } } })
  }

  beforeEach(() => {
    stubNotification('default')
  })

  afterEach(() => {
    delete window.Notification
  })

  it('renders both toggles from the prefs', () => {
    const wrapper = mountPanel({ sound: false, notify: true })
    expect(wrapper.get('#alert-sound').element.checked).toBe(false)
    expect(wrapper.get('#alert-notify').element.checked).toBe(true)
  })

  it('emits only the sound flag when it is switched off', async () => {
    const wrapper = mountPanel()
    await wrapper.get('#alert-sound').setValue(false)
    expect(wrapper.emitted('update')[0]).toEqual([{ sound: false }])
  })

  it('asks the browser for permission before storing the popup preference', async () => {
    const Fake = stubNotification('default', 'granted')
    const wrapper = mountPanel()

    await wrapper.get('#alert-notify').setValue(true)
    await flushPromises()

    expect(Fake.requestPermission).toHaveBeenCalled()
    expect(wrapper.emitted('update')[0]).toEqual([{ notify: true }])
  })

  // Storing it anyway would leave a toggle switched on that the browser will
  // silently ignore.
  it('reverts the toggle and stores nothing when permission is refused', async () => {
    stubNotification('default', 'denied')
    const wrapper = mountPanel()

    await wrapper.get('#alert-notify').setValue(true)
    await flushPromises()

    expect(wrapper.emitted('update')).toBeUndefined()
    expect(wrapper.get('#alert-notify').element.checked).toBe(false)
    expect(wrapper.text()).toContain('Blocked by your browser')
  })

  it('switches the popup off without re-asking for permission', async () => {
    const Fake = stubNotification('granted')
    const wrapper = mountPanel({ notify: true })

    await wrapper.get('#alert-notify').setValue(false)
    await flushPromises()

    expect(Fake.requestPermission).not.toHaveBeenCalled()
    expect(wrapper.emitted('update')[0]).toEqual([{ notify: false }])
  })

  it('disables the popup toggle where the browser has no notifications', () => {
    delete window.Notification
    const wrapper = mountPanel()
    expect(wrapper.get('#alert-notify').element.disabled).toBe(true)
    expect(wrapper.text()).toContain('no desktop notifications')
  })

  it('updates the displayed toggles when the prefs prop changes', async () => {
    const wrapper = mountPanel()
    await wrapper.setProps({ prefs: { ...prefs, sound: false, notify: true } })
    expect(wrapper.get('#alert-sound').element.checked).toBe(false)
    expect(wrapper.get('#alert-notify').element.checked).toBe(true)
  })
})
