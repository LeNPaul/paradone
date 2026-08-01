import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ArchiveView from './ArchiveView.vue'

const NOW = '2026-08-01T09:14:00.000Z'
const EARLIER = '2026-07-30T11:00:00.000Z'

function entry(overrides = {}) {
  return { id: 'a', text: 'send invoice', completedAt: NOW, archivedAt: NOW, ...overrides }
}

beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

describe('ArchiveView', () => {
  it('renders one row per archived task with its completion time', () => {
    const wrapper = mount(ArchiveView, { props: { entries: [entry()] } })
    expect(wrapper.findAll('.archive-view__entry')).toHaveLength(1)
    expect(wrapper.text()).toContain('send invoice')
    expect(wrapper.find('time').attributes('datetime')).toBe(NOW)
  })

  it('orders entries newest first', () => {
    const wrapper = mount(ArchiveView, {
      props: {
        entries: [
          entry({ id: 'a', text: 'book flights', completedAt: EARLIER, archivedAt: EARLIER }),
          entry({ id: 'b', text: 'send invoice' }),
        ],
      },
    })
    const rows = wrapper.findAll('.archive-view__entry')
    expect(rows[0].text()).toContain('send invoice')
    expect(rows[1].text()).toContain('book flights')
  })

  it('shows an empty state when nothing has been archived', () => {
    const wrapper = mount(ArchiveView, { props: { entries: [] } })
    expect(wrapper.text()).toContain('No tasks archived yet.')
    expect(wrapper.find('.archive-view__entries').exists()).toBe(false)
  })

  it('emits back', async () => {
    const wrapper = mount(ArchiveView, { props: { entries: [entry()] } })
    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('downloads the archive as markdown', async () => {
    const wrapper = mount(ArchiveView, { props: { entries: [entry()] } })
    await wrapper.findAll('button').find((b) => b.text() === 'Download archive').trigger('click')
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })
})
