import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownChecklist from './MarkdownChecklist.vue'

describe('MarkdownChecklist', () => {
  it('renders a checkbox input for checkbox lines and plain text for non-checkbox lines', () => {
    const wrapper = mount(MarkdownChecklist, {
      props: { modelValue: '- [ ] draft outline\n- [x] send invoice\n- ideas for post' },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0].element.checked).toBe(false)
    expect(checkboxes[1].element.checked).toBe(true)

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[2].text()).toBe('- ideas for post')
    expect(items[2].find('input').exists()).toBe(false)
  })

  it('strips the marker so a checkbox line label shows only the task text', () => {
    const wrapper = mount(MarkdownChecklist, {
      props: { modelValue: '- [ ] draft outline' },
    })
    expect(wrapper.find('label span').text()).toBe('draft outline')
  })

  it('emits update:modelValue with the toggled line on checkbox click', async () => {
    const wrapper = mount(MarkdownChecklist, {
      props: { modelValue: '- [ ] draft outline\n- [x] send invoice' },
    })

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([
      '- [x] draft outline\n- [x] send invoice',
    ])
  })

  it('only rewrites the toggled line, leaving the rest of the string untouched', async () => {
    const wrapper = mount(MarkdownChecklist, {
      props: { modelValue: '- [ ] draft outline\n- ideas for post\n- [x] send invoice' },
    })

    await wrapper.findAll('input[type="checkbox"]')[1].setValue(false)

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([
      '- [ ] draft outline\n- ideas for post\n- [ ] send invoice',
    ])
  })

  it('reflects a re-passed modelValue prop instead of holding local checked state', async () => {
    const wrapper = mount(MarkdownChecklist, {
      props: { modelValue: '- [ ] draft outline' },
    })

    await wrapper.setProps({ modelValue: '- [x] draft outline' })

    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true)
  })
})
