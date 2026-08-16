import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditPrompt from './AuditPrompt.vue'

// Match by label, not position — the buttons get reordered for visual hierarchy.
const continueButton = (wrapper) =>
  wrapper.findAll('button').find((b) => b.text() === 'Continue')

const discardButton = (wrapper) =>
  wrapper.findAll('button').find((b) => b.text() === 'Discard session')

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

  it('badges only the completed tasks that were added mid-session', () => {
    const wrapper = mount(AuditPrompt, {
      props: {
        taskListText: '',
        completedTasks: ['draft outline', 'reply to Mai'],
        addedTasks: ['reply to Mai'],
      },
    })
    const items = wrapper.findAll('#audit-completed-heading ~ ul li')
    expect(items[0].find('.task-badge').exists()).toBe(false)
    expect(items[1].find('.task-badge').text()).toBe('added')
  })

  // addedTasks is a superset of what got completed: it includes tasks added and
  // then left unticked, which belong on the remaining list, not this one.
  it('does not invent a completed row for an added task that was never ticked', () => {
    const wrapper = mount(AuditPrompt, {
      props: {
        taskListText: '- [ ] reply to Mai',
        completedTasks: [],
        addedTasks: ['reply to Mai'],
      },
    })
    expect(wrapper.findAll('#audit-completed-heading ~ ul li')).toHaveLength(0)
    expect(wrapper.find('[aria-labelledby="audit-goal-heading"]').text()).toContain('reply to Mai')
  })

  it('badges nothing when no addedTasks are given', () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: '', completedTasks: ['draft outline'] },
    })
    expect(wrapper.find('.task-badge').exists()).toBe(false)
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

  it('hides the completed section when nothing was checked off during the session', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '', completedTasks: [] } })
    expect(wrapper.find('#audit-completed-heading').exists()).toBe(false)
  })

  it('shows the captures recorded during the session', () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: '', capture: 'tabbed out to check email' },
    })
    expect(wrapper.text()).toContain('tabbed out to check email')
  })

  it('hides the captures section when nothing was recorded', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '', capture: '   ' } })
    expect(wrapper.find('#audit-capture-heading').exists()).toBe(false)
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

  // The notes field is free text the user may leave blank, so it asks rather
  // than demands — nothing about it gates Continue.
  it('labels the notes field as an invitation, not a required question', () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    expect(wrapper.find('label[for="audit-notes"]').text()).toBe('Anything worth noting?')
  })

  it('emits submit with the chosen quick-select value and trimmed notes', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[1].setValue()
    await wrapper.find('textarea').setValue('  tabbed out twice  ')
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [{ auditProductive: 'distracted', auditNotes: 'tabbed out twice', checkedTasks: [] }],
    ])
  })

  it('submits with empty notes, since free text is optional', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [{ auditProductive: 'focused', auditNotes: '', checkedTasks: [] }],
    ])
  })

  it('offers a Skip button that emits skip without requiring a quick-select choice', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    const skip = wrapper.findAll('button').find((b) => b.text() === 'Skip')
    expect(skip).toBeDefined()
    expect(skip.attributes('disabled')).toBeUndefined()

    await skip.trigger('click')
    expect(wrapper.emitted('skip')).toHaveLength(1)
  })

  it('asks for confirmation before discarding instead of emitting straight away', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })

    await discardButton(wrapper).trigger('click')

    expect(wrapper.emitted('discard')).toBeUndefined()
    expect(wrapper.text()).toContain('Discard session?')
    expect(wrapper.text()).toContain("This block won't be added to your audit log.")
  })

  it('emits discard once the dialog is confirmed', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })

    await discardButton(wrapper).trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Discard').trigger('click')

    expect(wrapper.emitted('discard')).toHaveLength(1)
  })

  it('does not emit discard when the dialog is cancelled', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })

    await discardButton(wrapper).trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Cancel').trigger('click')

    expect(wrapper.emitted('discard')).toBeUndefined()
  })
})

describe('AuditPrompt ticking tasks off', () => {
  const taskList = '- [ ] draft outline\n- [ ] send invoice'
  const tick = (wrapper, index) =>
    wrapper.findAll('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')[index]

  it('leaves a ticked task on screen, checked, so a mis-click can be undone', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 1).trigger('change')

    const list = wrapper.find('[aria-labelledby="audit-goal-heading"]')
    expect(list.text()).toContain('send invoice')
    expect(tick(wrapper, 1).element.checked).toBe(true)
    expect(tick(wrapper, 0).element.checked).toBe(false)
  })

  it('does not move a ticked task into Completed this session mid-audit', async () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: taskList, completedTasks: [] },
    })

    await tick(wrapper, 1).trigger('change')

    expect(wrapper.find('#audit-completed-heading').exists()).toBe(false)
  })

  it('reports the ticked tasks when the audit is submitted', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 1).trigger('change')
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')[0][0].checkedTasks).toEqual(['send invoice'])
  })

  it('reports the ticked tasks when the audit is skipped', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 0).trigger('change')
    await wrapper.findAll('button').find((b) => b.text() === 'Skip').trigger('click')

    expect(wrapper.emitted('skip')).toEqual([[{ checkedTasks: ['draft outline'] }]])
  })

  it('reports the ticked tasks when the session is discarded', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 0).trigger('change')
    await discardButton(wrapper).trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Discard').trigger('click')

    expect(wrapper.emitted('discard')).toEqual([[{ checkedTasks: ['draft outline'] }]])
  })

  it('forgets a tick that was undone before the audit was finished', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 1).trigger('change')
    await tick(wrapper, 1).trigger('change')
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')[0][0].checkedTasks).toEqual([])
  })

  // The list is a frozen snapshot of the unchecked remainder: tasks checked
  // before the audit stay under Completed this session and never become tickable.
  it('still leaves tasks completed during the block out of the list', async () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: '- [x] send invoice\n- [ ] draft outline' },
    })

    const boxes = wrapper.findAll('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')
    expect(boxes).toHaveLength(1)
    expect(wrapper.find('[aria-labelledby="audit-goal-heading"]').text()).not.toContain(
      'send invoice',
    )
  })
})
