import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditPrompt from './AuditPrompt.vue'

// Match by label, not position — the buttons get reordered for visual hierarchy.
const continueButton = (wrapper) =>
  wrapper.findAll('button').find((b) => b.text() === 'Continue')

describe('AuditPrompt', () => {
  it('shows the current Task List alongside the questions', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })
    expect(wrapper.text()).toContain('draft outline')
  })

  it('leaves completed tasks out of the Task List, showing them only as completed', () => {
    const wrapper = mount(AuditPrompt, {
      props: {
        taskListText: '- [x] send invoice\n- [ ] email Mai',
        completedTasks: ['send invoice'],
      },
    })
    const taskList = wrapper.find('[aria-labelledby="audit-goal-heading"]')
    expect(taskList.text()).toContain('email Mai')
    expect(taskList.text()).not.toContain('send invoice')

    const completed = wrapper.findAll('#audit-completed-heading ~ ul li')
    expect(completed.map((li) => li.text())).toEqual(['send invoice'])
  })

  it('says so when every task on the list is checked off', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [x] send invoice' } })
    expect(wrapper.find('[aria-labelledby="audit-goal-heading"]').text()).toContain(
      'Nothing left on the list.',
    )
  })

  it('lists the tasks checked off during the session', () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: '', completedTasks: ['draft outline', 'send invoice'] },
    })
    const items = wrapper.findAll('#audit-completed-heading ~ ul li')
    expect(items.map((li) => li.text())).toEqual(['draft outline', 'send invoice'])
  })

  it('says so when nothing was checked off during the session', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '', completedTasks: [] } })
    expect(wrapper.text()).toContain('No tasks checked off this session.')
  })

  it('shows the captures recorded during the session', () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: '', capture: 'tabbed out to check email' },
    })
    expect(wrapper.text()).toContain('tabbed out to check email')
  })

  it('shows a fallback when no captures were recorded', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '', capture: '   ' } })
    expect(wrapper.text()).toContain('No captures recorded.')
  })

  it('renders exactly three quick-select options', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios.map((r) => r.element.value)).toEqual(['focused', 'distracted', 'mixed'])
  })

  it('disables Continue until a quick-select option is chosen', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    const button = continueButton(wrapper)
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.findAll('input[type="radio"]')[1].setValue()
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('emits submit with the chosen quick-select value and trimmed notes', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[1].setValue()
    await wrapper.find('textarea').setValue('  tabbed out twice  ')
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [{ auditProductive: 'distracted', auditNotes: 'tabbed out twice' }],
    ])
  })

  it('submits with empty notes, since free text is optional', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

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
