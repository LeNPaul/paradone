import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditPrompt from './AuditPrompt.vue'

describe('AuditPrompt', () => {
  it('shows the current Task List alongside the questions', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [x] draft outline' } })
    expect(wrapper.text()).toContain('draft outline')
  })

  it('renders exactly three quick-select options', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios.map((r) => r.element.value)).toEqual(['focused', 'distracted', 'mixed'])
  })

  it('disables Continue until a quick-select option is chosen', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.findAll('input[type="radio"]')[1].setValue()
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('emits submit with the chosen quick-select value and trimmed notes', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[1].setValue()
    await wrapper.find('textarea').setValue('  tabbed out twice  ')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [{ auditProductive: 'distracted', auditNotes: 'tabbed out twice' }],
    ])
  })

  it('submits with empty notes, since free text is optional', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('submit')).toEqual([[{ auditProductive: 'focused', auditNotes: '' }]])
  })

  it('offers a Skip button that emits skip without requiring a quick-select choice', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    const skip = wrapper.findAll('button').find((b) => b.text() === 'Skip')
    expect(skip).toBeDefined()
    expect(skip.attributes('disabled')).toBeUndefined()

    await skip.trigger('click')
    expect(wrapper.emitted('skip')).toHaveLength(1)
  })
})
