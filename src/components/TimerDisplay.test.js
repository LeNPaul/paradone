import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimerDisplay from './TimerDisplay.vue'

const CIRCUMFERENCE = 2 * Math.PI * 45

function offsetOf(wrapper) {
  return Number(wrapper.find('.timer-display__progress').attributes('stroke-dashoffset'))
}

describe('TimerDisplay ring', () => {
  it('draws a full arc when nothing has elapsed', () => {
    const wrapper = mount(TimerDisplay, { props: { remainingMs: 60000, totalMs: 60000 } })
    expect(offsetOf(wrapper)).toBeCloseTo(0, 5)
  })

  it('draws half an arc at the halfway point', () => {
    const wrapper = mount(TimerDisplay, { props: { remainingMs: 30000, totalMs: 60000 } })
    expect(offsetOf(wrapper)).toBeCloseTo(CIRCUMFERENCE / 2, 5)
  })

  it('draws no arc when fully elapsed', () => {
    const wrapper = mount(TimerDisplay, { props: { remainingMs: 0, totalMs: 60000 } })
    expect(offsetOf(wrapper)).toBeCloseTo(CIRCUMFERENCE, 5)
  })

  // A zero total would divide by zero; the ring should read full, not blank.
  it('treats a zero total as not started', () => {
    const wrapper = mount(TimerDisplay, { props: { remainingMs: 0, totalMs: 0 } })
    expect(offsetOf(wrapper)).toBe(0)
  })

  // remainingMs can briefly exceed totalMs on resume, or go negative on overrun.
  it('clamps out-of-range remaining values', () => {
    const over = mount(TimerDisplay, { props: { remainingMs: 90000, totalMs: 60000 } })
    expect(offsetOf(over)).toBeCloseTo(0, 5)

    const under = mount(TimerDisplay, { props: { remainingMs: -5000, totalMs: 60000 } })
    expect(offsetOf(under)).toBeCloseTo(CIRCUMFERENCE, 5)
  })

  it('still renders the formatted time and an optional label', () => {
    const wrapper = mount(TimerDisplay, {
      props: { remainingMs: 90000, totalMs: 120000, label: 'Focus' },
    })
    expect(wrapper.find('.timer-display__time').text()).toBe('01:30')
    expect(wrapper.find('.timer-display__label').text()).toBe('Focus')
  })
})
