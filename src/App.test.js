import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import { setActiveSession, setPrefs } from './lib/storage.js'
import TimerDisplay from './components/TimerDisplay.vue'

beforeEach(() => {
  localStorage.clear()
  setPrefs({ workDuration: 25, breakDuration: 5 })
})

describe('setup', () => {
  it('shows the Setup screen with duration text, primer button, and Start button', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Work: 25 min · Break: 5 min')
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

describe('block end', () => {
  it('hides "Take a break" when breakDuration is 0', () => {
    setPrefs({ workDuration: 25, breakDuration: 0 })
    setActiveSession({
      state: 'blockEnd',
      sessionGoalText: '',
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
      sessionGoalText: '',
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
      sessionGoalText: '',
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
            sessionGoalText: '',
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
      sessionGoalText: '',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.find('input[aria-label="Capture a distraction"]').setValue('reply to Mai')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('reply to Mai')
  })
})

describe('audit and summary', () => {
  it('shows the audit prompt with the original session goal when state is audit', () => {
    setActiveSession({
      state: 'audit',
      sessionGoalText: '- [ ] draft outline',
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
      sessionGoalText: '- [ ] draft outline',
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

  it('rendering the summary screen shows the goal, captures, and audit answers as markdown', () => {
    setActiveSession({
      state: 'summary',
      sessionGoalText: '- [x] draft outline',
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

  it('clicking "Start new session" returns to a blank Setup screen', async () => {
    setActiveSession({
      state: 'summary',
      sessionGoalText: '- [x] draft outline',
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

    expect(wrapper.find('#session-goal-heading').exists()).toBe(true)
    expect(wrapper.find('.markdown-checklist').text()).toBe('')
  })
})

describe('interval wiring', () => {
  it('auto-transitions active -> blockEnd as real time passes', async () => {
    vi.useFakeTimers()
    try {
      const startedAt = Date.now()
      setActiveSession({
        state: 'active',
        sessionGoalText: '',
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
