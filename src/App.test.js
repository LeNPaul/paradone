import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import { setActiveSession, setPrefs, setGoalsList, getGoalsList } from './lib/storage.js'
import TimerDisplay from './components/TimerDisplay.vue'

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

describe('typing into the Task List', () => {
  it('typing into the Task List textarea at Setup renders it as a clickable checkbox', async () => {
    const wrapper = mount(App)
    const taskListSection = wrapper.get('section[aria-labelledby="task-list-heading"]')
    await taskListSection.find('textarea').setValue('- [ ] draft outline')

    expect(taskListSection.find('input[type="checkbox"]').exists()).toBe(true)
    expect(taskListSection.text()).toContain('draft outline')
  })

  it('typing into the Task List textarea persists across a remount (reload)', async () => {
    const wrapper = mount(App)
    const taskListTextarea = wrapper.get('textarea')
    await taskListTextarea.setValue('- [ ] draft outline')

    const reloaded = mount(App)
    expect(reloaded.get('textarea').element.value).toBe('- [ ] draft outline')
  })

  it('Active state renders the Task List without a textarea (checkbox-toggle only)', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    expect(wrapper.find('#active-heading').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
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
            captures: [],
            usedPrimer: false,
            auditProductive: state === 'summary' ? 'focused' : '',
            auditNotes: '',
            sessionStartedAt: Date.now(),
          },
    )
    const wrapper = mount(App)
    expect(wrapper.find('#capture-heading').exists()).toBe(false)
  })

  it('typing and submitting a capture during an active block shows it in the rendered list', async () => {
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.find('input[aria-label="Capture a distraction"]').setValue('reply to Mai')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('reply to Mai')
  })
})

describe('audit and summary', () => {
  it('shows the audit prompt with the current Task List when state is audit', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'audit',
      timer: null,
      captures: [],
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    expect(wrapper.find('#audit-heading').exists()).toBe(true)
    expect(wrapper.text()).toContain('draft outline')
  })

  it('submitting the audit prompt transitions to the summary screen', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      captures: [],
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

  it('rendering the summary screen shows the task list, captures, and audit answers as markdown', () => {
    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    setActiveSession({
      state: 'summary',
      timer: null,
      captures: [{ text: 'reply to Mai', timestamp: '2026-07-13T09:15:00Z' }],
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
      captures: [{ text: 'reply to Mai', timestamp: '2026-07-13T09:15:00Z' }],
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got it done',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const startNewButton = wrapper.findAll('button').find((b) => b.text() === 'Start new session')
    await startNewButton.trigger('click')

    expect(wrapper.find('#task-list-heading').exists()).toBe(true)
    expect(wrapper.get('textarea').element.value).toBe('- [x] draft outline')
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
