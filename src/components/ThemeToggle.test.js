import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from './ThemeToggle.vue'

function option(wrapper, label) {
  return wrapper.findAll('button').find((b) => b.text() === label)
}

describe('rendering', () => {
  it('marks the active theme as pressed and the other as not', () => {
    const wrapper = mount(ThemeToggle, { props: { theme: 'dark' } })
    expect(option(wrapper, 'Light').attributes('aria-pressed')).toBe('false')
    expect(option(wrapper, 'Dark').attributes('aria-pressed')).toBe('true')
  })
})

describe('choosing a theme', () => {
  it('emits update with the clicked theme', async () => {
    const wrapper = mount(ThemeToggle, { props: { theme: 'light' } })
    await option(wrapper, 'Dark').trigger('click')
    expect(wrapper.emitted('update')[0]).toEqual(['dark'])
  })

  it('emits even when the clicked theme is already active', async () => {
    const wrapper = mount(ThemeToggle, { props: { theme: 'light' } })
    await option(wrapper, 'Light').trigger('click')
    expect(wrapper.emitted('update')[0]).toEqual(['light'])
  })
})
