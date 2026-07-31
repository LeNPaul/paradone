import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CaptureBox from './CaptureBox.vue'

describe('CaptureBox', () => {
  it('renders the current value in the textarea', () => {
    const wrapper = mount(CaptureBox, { props: { modelValue: 'reply to Mai\ncheck Slack' } })
    expect(wrapper.find('textarea').element.value).toBe('reply to Mai\ncheck Slack')
  })

  it('emits update:modelValue as the user types', async () => {
    const wrapper = mount(CaptureBox, { props: { modelValue: '' } })
    await wrapper.find('textarea').setValue('reply to Mai')
    expect(wrapper.emitted('update:modelValue')).toEqual([['reply to Mai']])
  })
})
