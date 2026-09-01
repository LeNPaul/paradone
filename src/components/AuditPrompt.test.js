import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditPrompt from './AuditPrompt.vue'

// Match by label, not position — the buttons get reordered for visual hierarchy.
const continueButton = (wrapper) =>
  wrapper.findAll('button').find((b) => b.text() === 'Continue')

const discardButton = (wrapper) =>
  wrapper.findAll('button').find((b) => b.text() === 'Discard session')

describe('AuditPrompt', () => {
  it('opens with the focused time the session actually ran for', () => {
    const wrapper = mount(AuditPrompt, { props: { focusedMs: 75 * 60 * 1000 } })
    expect(wrapper.text()).toContain('1h 15m focused')
  })

  it('reports zero focused time when none is given', () => {
    expect(mount(AuditPrompt).text()).toContain('0m focused')
  })

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
    const taskList = wrapper.find('[aria-labelledby="audit-goal-heading"]')
    expect(taskList.text()).toContain('Nothing left on the list.')
    // Still offers a way to add: work that surfaced during the block has to go
    // somewhere even when nothing is left over.
    expect(taskList.findAll('button').some((b) => b.text() === '+ Add Task')).toBe(true)
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
      [{ auditProductive: 'distracted', auditNotes: 'tabbed out twice', taskListText: '' }],
    ])
  })

  it('submits with empty notes, since free text is optional', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '' } })
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [{ auditProductive: 'focused', auditNotes: '', taskListText: '' }],
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

  it('logs a typed task as completed on Enter, and clears the field', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })

    const field = wrapper.find('#audit-done')
    await field.setValue('answered support mail')
    await field.trigger('keydown.enter')

    const completed = wrapper.findAll('#audit-completed-heading ~ ul li')
    expect(completed).toHaveLength(1)
    expect(completed[0].text()).toContain('answered support mail')
    expect(completed[0].find('.task-badge').text()).toBe('added')
    expect(field.element.value).toBe('')
  })

  // It reads as done work, so it belongs under Completed — not as a checked row
  // in the list of what's left.
  it('keeps a typed task out of the remaining Task list', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })

    const field = wrapper.find('#audit-done')
    await field.setValue('answered support mail')
    await field.trigger('keydown.enter')

    const list = wrapper.find('[aria-labelledby="audit-goal-heading"]')
    expect(list.text()).toContain('draft outline')
    expect(list.text()).not.toContain('answered support mail')
  })

  it('reports typed tasks as checked lines when the audit is submitted', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })

    const field = wrapper.find('#audit-done')
    await field.setValue('answered support mail')
    await field.trigger('keydown.enter')
    await field.setValue('fixed the build')
    await field.trigger('keydown.enter')
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')[0][0].taskListText).toBe(
      '- [ ] draft outline\n- [x] answered support mail\n- [x] fixed the build',
    )
  })

  it('ignores Enter on an empty field', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })

    const field = wrapper.find('#audit-done')
    await field.setValue('   ')
    await field.trigger('keydown.enter')

    expect(wrapper.find('#audit-completed-heading').exists()).toBe(false)
  })

  it('takes a typed task back out of the list when it is removed', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })

    const field = wrapper.find('#audit-done')
    await field.setValue('anwsered support mial')
    await field.trigger('keydown.enter')
    await wrapper.find('[aria-label="Remove completed task"]').trigger('click')

    expect(wrapper.find('#audit-completed-heading').exists()).toBe(false)
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')[0][0].taskListText).toBe('- [ ] draft outline')
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

    expect(wrapper.emitted('submit')[0][0].taskListText).toBe(
      '- [ ] draft outline\n- [x] send invoice',
    )
  })

  it('reports the ticked tasks when the audit is skipped', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 0).trigger('change')
    await wrapper.findAll('button').find((b) => b.text() === 'Skip').trigger('click')

    expect(wrapper.emitted('skip')).toEqual([
      [{ taskListText: '- [x] draft outline\n- [ ] send invoice' }],
    ])
  })

  it('reports the ticked tasks when the session is discarded', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 0).trigger('change')
    await discardButton(wrapper).trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Discard').trigger('click')

    expect(wrapper.emitted('discard')).toEqual([
      [{ taskListText: '- [x] draft outline\n- [ ] send invoice' }],
    ])
  })

  it('forgets a tick that was undone before the audit was finished', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 1).trigger('change')
    await tick(wrapper, 1).trigger('change')
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')

    expect(wrapper.emitted('submit')[0][0].taskListText).toBe(taskList)
  })

  // The list is a frozen snapshot with the checked lines hidden: tasks checked
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

describe('AuditPrompt editing the task list', () => {
  const taskList = '- [ ] draft outline\n- [ ] send invoice'
  const tick = (wrapper, index) =>
    wrapper.findAll('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')[index]

  const addTask = async (wrapper, text) => {
    await wrapper.findAll('button').find((b) => b.text().includes('Add Task')).trigger('click')
    await wrapper.find('dialog input[type="text"]').setValue(text)
    await wrapper.find('dialog form').trigger('submit')
  }

  const finish = async (wrapper) => {
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await continueButton(wrapper).trigger('click')
  }

  it('adds a task as a tickable row and reports it when the audit is finished', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: '- [ ] draft outline' } })

    await addTask(wrapper, 'reply to Mai')

    const boxes = wrapper.findAll('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')
    expect(boxes).toHaveLength(2)
    await boxes[1].trigger('change')

    await finish(wrapper)
    expect(wrapper.emitted('submit')[0][0].taskListText).toBe(
      '- [ ] draft outline\n- [x] reply to Mai',
    )
  })

  // The hidden lines are hidden, not stripped — otherwise adding a task at the
  // audit would quietly delete the work the block just completed.
  it('keeps the tasks completed during the block in the reported list', async () => {
    const wrapper = mount(AuditPrompt, {
      props: { taskListText: '- [x] send invoice\n- [ ] draft outline' },
    })

    await addTask(wrapper, 'reply to Mai')
    await finish(wrapper)

    expect(wrapper.emitted('submit')[0][0].taskListText).toBe(
      '- [x] send invoice\n- [ ] draft outline\n- [ ] reply to Mai',
    )
  })

  it('drops a deleted task from the reported list', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await wrapper
      .findAll('[aria-labelledby="audit-goal-heading"] button[aria-label="Delete task"]')[0]
      .trigger('click')
    await finish(wrapper)

    expect(wrapper.emitted('submit')[0][0].taskListText).toBe('- [ ] send invoice')
  })

  // The audit asks what actually got done, and the answer is often "that, plus
  // this new thing I just remembered" — so the shortcut is live here too.
  it('opens the Add Task modal from the configured shortcut key', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList, shortcutKey: 'a' } })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }))
    await wrapper.vm.$nextTick()

    await wrapper.find('dialog input[type="text"]').setValue('reply to Mai')
    await wrapper.find('dialog form').trigger('submit')
    await finish(wrapper)

    expect(wrapper.emitted('submit')[0][0].taskListText).toBe(`${taskList}\n- [ ] reply to Mai`)
    wrapper.unmount()
  })

  it('does not offer the archive sweep, which would strip the block\'s own diff', async () => {
    const wrapper = mount(AuditPrompt, { props: { taskListText: taskList } })

    await tick(wrapper, 0).trigger('change')

    expect(wrapper.findAll('button').some((b) => b.text().startsWith('Archive completed'))).toBe(
      false,
    )
  })
})
