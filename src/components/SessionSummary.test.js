import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SessionSummary from './SessionSummary.vue'

const baseProps = {
  taskListText: '- [x] draft outline',
  capture: 'reply to Mai re: weekend',
  auditProductive: 'focused',
  auditNotes: 'got the outline done',
}

beforeEach(() => {
  navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
  global.URL.createObjectURL = vi.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

describe('SessionSummary', () => {
  it('renders markdown containing the task list, the capture text, and the audit answers', () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    const text = wrapper.text()
    expect(text).toContain('draft outline')
    expect(text).toContain('reply to Mai re: weekend')
    expect(text).toContain('Focused')
    expect(text).toContain('got the outline done')
  })

  it('renders a fallback message when the capture is empty', () => {
    const wrapper = mount(SessionSummary, { props: { ...baseProps, capture: '   ' } })
    expect(wrapper.text()).toContain('No captures recorded.')
  })

  it('copies the exact markdown shown on screen to the clipboard', async () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    const rendered = wrapper.find('pre').element.textContent
    await wrapper.find('button').trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(rendered)
  })

  it('creates a blob URL and triggers a download on Download', async () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('emits start-new-session with no payload', async () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    const buttons = wrapper.findAll('button')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('start-new-session')).toEqual([[]])
  })
})
