import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import { setActiveSession, setPrefs, setGoalsList, getGoalsList, getActiveSession } from './lib/storage.js'
import TimerDisplay from './components/TimerDisplay.vue'
import { DEFAULT_TITLE } from './lib/title.js'

beforeEach(() => {
  localStorage.clear()
  setPrefs({ workDuration: 25, breakDuration: 5 })
})

describe('setup', () => {
  it('shows the Setup screen with duration inputs, primer button, and Start button', () => {
    const wrapper = mount(App)
    expect(wrapper.get('#work-duration').element.value).toBe('25')
    expect(wrapper.get('#break-duration').element.value).toBe('5')
    expect(wrapper.text()).toContain('2-minute primer')
    expect(wrapper.get('button[type="button"]').exists()).toBe(true)
  })

  it('clicking Start renders the Active section with a TimerDisplay', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    expect(wrapper.find('#active-heading').exists()).toBe(true)
    expect(wrapper.findComponent(TimerDisplay).exists()).toBe(true)
  })
})

describe('primer setup', () => {
  // Clicking the primer affordance at Setup lands on the breakdown screen.
  async function openPrimerSetup(wrapper) {
    const primerButton = wrapper.findAll('button').find((b) => b.text().includes('2-minute primer'))
    await primerButton.trigger('click')
  }

  it('clicking the primer button asks for a 2-minute breakdown instead of starting the countdown', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)

    expect(wrapper.find('#primer-setup-heading').exists()).toBe(true)
    expect(wrapper.find('#primer-intent').exists()).toBe(true)
    expect(wrapper.find('#primer-heading').exists()).toBe(false)
  })

  it('"Start 2 minutes" stays disabled until the breakdown has real text', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)
    const startButton = () => wrapper.findAll('button').find((b) => b.text() === 'Start 2 minutes')

    expect(startButton().element.disabled).toBe(true)
    await wrapper.get('#primer-intent').setValue('   ')
    expect(startButton().element.disabled).toBe(true)
    await wrapper.get('#primer-intent').setValue('open the doc')
    expect(startButton().element.disabled).toBe(false)
  })

  it('starting the primer shows the countdown with the breakdown alongside it', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)
    await wrapper.get('#primer-intent').setValue('open the doc')
    await wrapper.findAll('button').find((b) => b.text() === 'Start 2 minutes').trigger('click')

    expect(wrapper.find('#primer-heading').exists()).toBe(true)
    expect(wrapper.get('section[aria-labelledby="primer-heading"]').text()).toContain('open the doc')
  })

  it('Back returns to Setup and discards the draft', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)
    await wrapper.get('#primer-intent').setValue('open the doc')
    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')

    expect(wrapper.find('#start-heading').exists()).toBe(true)
    await openPrimerSetup(wrapper)
    expect(wrapper.get('#primer-intent').element.value).toBe('')
  })

  it('shows the breakdown during the active block, and nothing when the session skipped the primer', () => {
    const timer = { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true }
    setActiveSession({ state: 'active', timer, primerIntent: 'open the doc' })
    expect(mount(App).get('section[aria-labelledby="active-heading"]').text()).toContain('open the doc')

    setActiveSession({ state: 'active', timer, primerIntent: '' })
    expect(mount(App).get('section[aria-labelledby="active-heading"]').text()).not.toContain('Primer:')
  })
})

// Add a task at Setup through the Add-Task modal.
async function addTaskViaModal(wrapper, text) {
  const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add Task'))
  await addButton.trigger('click')
  await wrapper.find('dialog input[type="text"]').setValue(text)
  await wrapper.find('dialog form').trigger('submit')
}

describe('adding to the Task List', () => {
  it('adding a task via the modal at Setup renders it as a clickable checkbox', async () => {
    const wrapper = mount(App)
    await addTaskViaModal(wrapper, 'draft outline')

    const taskListSection = wrapper.get('section[aria-labelledby="task-list-heading"]')
    expect(taskListSection.find('input[type="checkbox"]').exists()).toBe(true)
    expect(taskListSection.text()).toContain('draft outline')
  })

  it('an added task persists across a remount (reload)', async () => {
    const wrapper = mount(App)
    await addTaskViaModal(wrapper, 'draft outline')

    const reloaded = mount(App)
    const reloadedSection = reloaded.get('section[aria-labelledby="task-list-heading"]')
    expect(reloadedSection.find('input[type="checkbox"]').exists()).toBe(true)
    expect(reloadedSection.text()).toContain('draft outline')
  })

  it('Active state renders the Task List without a textarea (checkbox-toggle only)', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    const activeSection = wrapper.find('[aria-labelledby="active-heading"]')
    expect(activeSection.exists()).toBe(true)
    // The Task List is checkbox-toggle only here; the capture textarea lives in its own section.
    expect(activeSection.find('textarea').exists()).toBe(false)
    expect(activeSection.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('toggling a checkbox during an active session persists to the Task List storage', async () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.get('input[type="checkbox"]').setValue(true)

    expect(getGoalsList().text).toBe('- [x] draft outline')
  })
})

describe('pausing and stopping an active session', () => {
  function mountActive() {
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    return mount(App)
  }

  it('Active state renders Pause and Stop buttons', () => {
    const wrapper = mountActive()
    const buttonText = wrapper.findAll('button').map((b) => b.text())
    expect(buttonText).toContain('Pause')
    expect(buttonText).toContain('Stop & log session')
  })

  it('clicking Pause swaps the button to Resume', async () => {
    const wrapper = mountActive()
    const pauseButton = wrapper.findAll('button').find((b) => b.text() === 'Pause')
    await pauseButton.trigger('click')
    const buttonText = wrapper.findAll('button').map((b) => b.text())
    expect(buttonText).toContain('Resume')
    expect(buttonText).not.toContain('Pause')
  })

  it('clicking Stop transitions to the Audit screen', async () => {
    const wrapper = mountActive()
    const stopButton = wrapper.findAll('button').find((b) => b.text() === 'Stop & log session')
    await stopButton.trigger('click')
    expect(wrapper.find('#audit-heading').exists()).toBe(true)
  })
})

describe('block end', () => {
  it('hides "Take a break" when breakDuration is 0', () => {
    setPrefs({ workDuration: 25, breakDuration: 0 })
    setActiveSession({
      state: 'blockEnd',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 25 * 60 * 1000, running: false },
    })
    const wrapper = mount(App)
    const buttons = wrapper.findAll('button').map((b) => b.text())
    expect(buttons).not.toContain('Take a break')
    expect(buttons).toContain('Keep going')
  })

  it('shows "Take a break" when breakDuration is greater than 0', () => {
    setActiveSession({
      state: 'blockEnd',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 25 * 60 * 1000, running: false },
    })
    const wrapper = mount(App)
    const buttons = wrapper.findAll('button').map((b) => b.text())
    expect(buttons).toContain('Take a break')
  })
})

describe('capture box', () => {
  it.each(['primer', 'active', 'break'])('is shown while state is %s', (state) => {
    setActiveSession({
      state,
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    expect(wrapper.find('#capture-heading').exists()).toBe(true)
  })

  it.each(['setup', 'blockEnd', 'audit', 'summary'])('is hidden while state is %s', (state) => {
    setActiveSession(
      state === 'setup'
        ? null
        : {
            state,
            timer: null,
            capture: '',
            usedPrimer: false,
            auditProductive: state === 'summary' ? 'focused' : '',
            auditNotes: '',
            sessionStartedAt: Date.now(),
          },
    )
    const wrapper = mount(App)
    expect(wrapper.find('#capture-heading').exists()).toBe(false)
  })

  it('typing into the capture textarea during an active block persists to the session', async () => {
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.find('textarea[aria-label="Capture"]').setValue('reply to Mai')
    await nextTick()
    expect(getActiveSession().capture).toBe('reply to Mai')
  })
})

describe('audit and summary', () => {
  it('shows the audit prompt with the current Task List and session captures when state is audit', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: 'tabbed out to check email',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    expect(wrapper.find('#audit-heading').exists()).toBe(true)
    expect(wrapper.text()).toContain('draft outline')
    expect(wrapper.text()).toContain('tabbed out to check email')
  })

  it('reports only the tasks ticked during the block, from Start through to the summary export', async () => {
    setGoalsList({ text: '- [x] send invoice\n- [ ] draft outline', updatedAt: null })
    const wrapper = mount(App)

    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')

    // Tick the second task; the first was already done before the block began.
    await wrapper.findAll('input[type="checkbox"]')[1].setValue(true)
    const stopButton = wrapper.findAll('button').find((b) => b.text() === 'Stop & log session')
    await stopButton.trigger('click')

    const completed = wrapper.findAll('#audit-completed-heading ~ ul li').map((li) => li.text())
    expect(completed).toEqual(['draft outline'])

    await wrapper.findAll('input[type="radio"]')[0].setValue()
    const continueButton = wrapper.findAll('button').find((b) => b.text() === 'Continue')
    await continueButton.trigger('click')

    expect(wrapper.find('#summary-heading').exists()).toBe(true)
    expect(wrapper.text()).toContain('## Completed this session\n- draft outline')
  })

  it('submitting the audit prompt transitions to the summary screen', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    const continueButton = wrapper.findAll('button').find((b) => b.text() === 'Continue')
    await continueButton.trigger('click')
    expect(wrapper.find('#summary-heading').exists()).toBe(true)
  })

  it('skipping the audit prompt transitions to the summary screen', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const skipButton = wrapper.findAll('button').find((b) => b.text() === 'Skip')
    await skipButton.trigger('click')
    expect(wrapper.find('#summary-heading').exists()).toBe(true)
  })

  it('rendering the summary screen shows the task list, capture text, and audit answers as markdown', () => {
    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    setActiveSession({
      state: 'summary',
      timer: null,
      capture: 'reply to Mai',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got it done',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const text = wrapper.text()
    expect(text).toContain('draft outline')
    expect(text).toContain('reply to Mai')
    expect(text).toContain('got it done')
  })

  it('clicking "Start new session" returns to Setup with the Task List preserved (not reset)', async () => {
    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    setActiveSession({
      state: 'summary',
      timer: null,
      capture: 'reply to Mai',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got it done',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const startNewButton = wrapper.findAll('button').find((b) => b.text() === 'Start new session')
    await startNewButton.trigger('click')

    expect(wrapper.find('#task-list-heading').exists()).toBe(true)
    const taskListSection = wrapper.get('section[aria-labelledby="task-list-heading"]')
    expect(taskListSection.find('input[type="checkbox"]').element.checked).toBe(true)
    expect(taskListSection.text()).toContain('draft outline')
  })
})

describe('audit log', () => {
  it('clicking "View log" replaces Setup with the log screen', async () => {
    const wrapper = mount(App)
    const viewLogButton = wrapper.findAll('button').find((b) => b.text() === 'View log')
    await viewLogButton.trigger('click')

    expect(wrapper.find('#log-heading').exists()).toBe(true)
    expect(wrapper.find('#task-list-heading').exists()).toBe(false)
    expect(wrapper.find('#start-heading').exists()).toBe(false)
  })

  it('clicking Back returns to Setup', async () => {
    const wrapper = mount(App)
    await wrapper.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')

    expect(wrapper.find('#log-heading').exists()).toBe(false)
    expect(wrapper.find('#task-list-heading').exists()).toBe(true)
  })

  it('shows an audit completed in this session, without a reload', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await wrapper.findAll('button').find((b) => b.text() === 'Continue').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Start new session').trigger('click')

    await wrapper.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    expect(wrapper.findAll('.session-log__entry')).toHaveLength(1)
  })

  it('reports an empty log when no audits have been recorded', async () => {
    const wrapper = mount(App)
    await wrapper.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    expect(wrapper.text()).toContain('No audits logged yet.')
  })
})

describe('interval wiring', () => {
  it('auto-transitions active -> blockEnd as real time passes', async () => {
    vi.useFakeTimers()
    try {
      const startedAt = Date.now()
      setActiveSession({
        state: 'active',
        timer: { durationMs: 25 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
      })
      const wrapper = mount(App)
      expect(wrapper.find('#active-heading').exists()).toBe(true)

      await vi.advanceTimersByTimeAsync(25 * 60 * 1000 + 500)
      await flushPromises()

      expect(wrapper.find('#block-end-heading').exists()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('browser tab title', () => {
  it('is the default title at Setup', () => {
    mount(App)
    expect(document.title).toBe(DEFAULT_TITLE)
  })

  it('counts down in the tab while a session is active', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    expect(document.title).toMatch(/^⏱ \d{2}:\d{2} Focus — Paradone$/)
  })

  it('marks the tab as paused', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    const pauseButton = wrapper.findAll('button').find((b) => b.text() === 'Pause')
    await pauseButton.trigger('click')
    expect(document.title).toMatch(/^⏸ \d{2}:\d{2} Focus — Paradone$/)
  })

  it('reverts to the default title once the session stops', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    const stopButton = wrapper.findAll('button').find((b) => b.text() === 'Stop & log session')
    await stopButton.trigger('click')
    expect(document.title).toBe(DEFAULT_TITLE)
  })
})
