import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CaptureBox from './CaptureBox.vue'

describe('CaptureBox', () => {
  it('renders "No captures yet." when the list is empty', () => {
    const wrapper = mount(CaptureBox, { props: { captures: [] } })
    expect(wrapper.text()).toContain('No captures yet.')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('renders one item per capture, with a formatted time and the text, in order', () => {
    const wrapper = mount(CaptureBox, {
      props: {
        captures: [
          { text: 'reply to Mai re: weekend', timestamp: '2026-07-13T09:15:00Z' },
          { text: 'check Slack', timestamp: '2026-07-13T09:22:00Z' },
        ],
      },
    })
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('reply to Mai re: weekend')
    expect(items[1].text()).toContain('check Slack')
  })

  it('emits add with the trimmed text and clears the input on submit', async () => {
    const wrapper = mount(CaptureBox, { props: { captures: [] } })
    const input = wrapper.find('input')
    await input.setValue('  reply to Mai  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')).toEqual([['reply to Mai']])
    expect(input.element.value).toBe('')
  })

  it('does not emit add for empty or whitespace-only input', async () => {
    const wrapper = mount(CaptureBox, { props: { captures: [] } })
    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('add')).toBeUndefined()
  })
})
