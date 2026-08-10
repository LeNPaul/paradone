import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SessionSummary from './SessionSummary.vue'
import { buildSummaryMarkdown } from '../lib/summary.js'

const baseProps = {
  completedTasks: ['draft outline'],
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
  it('renders the capture text and the audit answers', () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    const text = wrapper.text()
    expect(text).toContain('reply to Mai re: weekend')
    expect(text).toContain('Focused')
    expect(text).toContain('got the outline done')
  })

  // The summary is about the block that just happened, so the standing Task
  // List is out: completed work appears once, under Completed this session.
  it('does not render the Task List', () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    expect(wrapper.find('#summary-tasks-heading').exists()).toBe(false)
    expect(wrapper.find('.markdown-checklist').exists()).toBe(false)
  })

  it('omits the entire Audit section when the audit was skipped', () => {
    const wrapper = mount(SessionSummary, {
      props: { ...baseProps, auditProductive: '', auditNotes: '' },
    })
    expect(wrapper.find('#summary-audit-heading').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Focus:')
  })

  it('lists the tasks completed this session in their own section', () => {
    const wrapper = mount(SessionSummary, {
      props: { ...baseProps, completedTasks: ['draft outline', 'send invoice'] },
    })
    const completed = wrapper
      .findAll('#summary-completed-heading ~ ul li')
      .map((li) => li.text())
    expect(completed).toEqual(['draft outline', 'send invoice'])
  })

  it('badges only the completed tasks that were added mid-session', () => {
    const wrapper = mount(SessionSummary, {
      props: {
        ...baseProps,
        completedTasks: ['draft outline', 'reply to Mai'],
        addedTasks: ['reply to Mai'],
      },
    })
    const items = wrapper.findAll('#summary-completed-heading ~ ul li')
    expect(items[0].find('.task-badge').exists()).toBe(false)
    expect(items[1].find('.task-badge').text()).toBe('added')
  })

  it('renders a fallback message when nothing was completed this session', () => {
    const wrapper = mount(SessionSummary, { props: { ...baseProps, completedTasks: [] } })
    expect(wrapper.text()).toContain('No tasks checked off this session.')
  })

  it('renders a fallback message when the capture is empty', () => {
    const wrapper = mount(SessionSummary, { props: { ...baseProps, capture: '   ' } })
    expect(wrapper.text()).toContain('No captures recorded.')
  })

  // The screen renders structured markup; the export stays markdown, built from
  // the same props by the one module that owns the wire format.
  it('copies the markdown export of the rendered session to the clipboard', async () => {
    const wrapper = mount(SessionSummary, { props: baseProps })
    await wrapper.find('button').trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(buildSummaryMarkdown(baseProps))
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
