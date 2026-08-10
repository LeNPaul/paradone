import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
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
