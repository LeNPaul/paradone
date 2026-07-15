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
