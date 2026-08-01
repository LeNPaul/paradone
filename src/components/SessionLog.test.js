import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SessionLog from './SessionLog.vue'

function session(overrides = {}) {
  return {
    id: 'a',
    date: '2026-08-01T13:50:00.000Z',
    auditedAt: '2026-08-01T14:15:00.000Z',
    taskListText: '- [x] draft outline',
    plannedDuration: 25,
    actualDuration: 25,
    capture: 'reply to Mai',
    usedPrimer: false,
    auditProductive: 'focused',
    auditNotes: 'got the outline done',
    completed: true,
    ...overrides,
  }
}

beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

describe('SessionLog', () => {
  it('renders one entry per logged audit, with its timing and audit answers', () => {
    const wrapper = mount(SessionLog, { props: { sessions: [session()] } })
    expect(wrapper.findAll('.session-log__entry')).toHaveLength(1)
    const text = wrapper.text()
    expect(text).toContain('25 min planned / 25 min actual')
    expect(text).toContain('Focused')
    expect(text).toContain('got the outline done')
  })

  it('shows the 2-minute breakdown on entries that used the primer', () => {
    const wrapper = mount(SessionLog, {
      props: { sessions: [session({ primerIntent: 'open the doc' })] },
    })
    expect(wrapper.text()).toContain('Primer: open the doc')
  })

  it('lists the tasks completed during the session', () => {
    const wrapper = mount(SessionLog, {
      props: { sessions: [session({ completedTasks: ['draft outline', 'send invoice'] })] },
    })
    const items = wrapper.findAll('.session-log__entry li')
    expect(items.map((li) => li.text())).toEqual(['draft outline', 'send invoice'])
  })

  it('renders a record written before completed-task tracking existed', () => {
    const wrapper = mount(SessionLog, { props: { sessions: [session()] } })
    expect(wrapper.findAll('.session-log__entry li')).toHaveLength(0)
    expect(wrapper.text()).toContain('got the outline done')
  })

  it('lists entries newest first regardless of stored order', () => {
    const wrapper = mount(SessionLog, {
      props: {
        sessions: [
          session({ id: 'old', auditedAt: '2026-07-30T09:00:00.000Z', auditNotes: 'older note' }),
          session({ id: 'new', auditedAt: '2026-08-01T14:15:00.000Z', auditNotes: 'newer note' }),
        ],
      },
    })
    const entries = wrapper.findAll('.session-log__entry')
    expect(entries[0].text()).toContain('newer note')
    expect(entries[1].text()).toContain('older note')
  })

  it('marks a skipped audit instead of showing a focus rating', () => {
    const wrapper = mount(SessionLog, {
      props: { sessions: [session({ auditProductive: '', auditNotes: '' })] },
    })
    expect(wrapper.text()).toContain('Audit skipped')
  })

  it('shows an empty state when nothing has been logged', () => {
    const wrapper = mount(SessionLog, { props: { sessions: [] } })
    expect(wrapper.findAll('.session-log__entry')).toHaveLength(0)
    expect(wrapper.text()).toContain('No audits logged yet.')
  })

  it('downloads the whole log as one markdown file', async () => {
    const wrapper = mount(SessionLog, { props: { sessions: [session()] } })
    const downloadButton = wrapper.findAll('button').find((b) => b.text() === 'Download log')
    await downloadButton.trigger('click')

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('emits back with no payload', async () => {
    const wrapper = mount(SessionLog, { props: { sessions: [] } })
    const backButton = wrapper.findAll('button').find((b) => b.text() === 'Back')
    await backButton.trigger('click')
    expect(wrapper.emitted('back')).toEqual([[]])
  })
})
