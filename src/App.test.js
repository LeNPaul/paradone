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
