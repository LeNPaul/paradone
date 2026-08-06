import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataPanel from './DataPanel.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const BACKUP = {
  format: 'paradone-backup',
  version: 1,
  exportedAt: '2026-08-05T09:14:00.000Z',
  data: {
    prefs: { workDuration: 50, breakDuration: 10, theme: 'dark' },
    goalsList: { text: '- [ ] draft outline', updatedAt: '2026-08-05T09:14:00.000Z' },
    sessions: [],
    archive: { completedAt: {}, archived: [] },
  },
}

function click(wrapper, label) {
  return wrapper.findAll('button').find((b) => b.text() === label).trigger('click')
}

// The real <input type="file"> can't be given files in jsdom, so stand a fake
// File on it — the component only ever calls .text().
async function pickFile(wrapper, text) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: [{ text: () => Promise.resolve(text) }],
    configurable: true,
  })
  await input.trigger('change')
  await wrapper.vm.$nextTick()
}

describe('DataPanel', () => {
  it('emits export when the export button is clicked', async () => {
    const wrapper = mount(DataPanel)
    await click(wrapper, 'Export data')
    expect(wrapper.emitted('export')).toHaveLength(1)
  })

  it('shows an error and restores nothing when the file is not a backup', async () => {
    const wrapper = mount(DataPanel)

    await pickFile(wrapper, '{"foo":1}')

    expect(wrapper.text()).toContain("That doesn't look like a Paradone backup.")
    expect(wrapper.emitted('restore')).toBeUndefined()
  })

  it('shows an error when the file is not JSON at all', async () => {
    const wrapper = mount(DataPanel)

    await pickFile(wrapper, 'not json')

    expect(wrapper.text()).toContain("That file isn't valid JSON.")
  })

  it('asks for confirmation before restoring instead of emitting straight away', async () => {
    const wrapper = mount(DataPanel)

    await pickFile(wrapper, JSON.stringify(BACKUP))

    expect(wrapper.emitted('restore')).toBeUndefined()
    expect(wrapper.text()).toContain('Replace all data?')
    expect(wrapper.text()).toContain('ends any session in progress')
  })

  it('emits restore with the parsed data once the dialog is confirmed', async () => {
    const wrapper = mount(DataPanel)

    await pickFile(wrapper, JSON.stringify(BACKUP))
    await click(wrapper, 'Replace')

    expect(wrapper.emitted('restore')).toHaveLength(1)
    expect(wrapper.emitted('restore')[0][0]).toEqual(BACKUP.data)
  })

  it('does not emit restore when the dialog is cancelled', async () => {
    const wrapper = mount(DataPanel)

    await pickFile(wrapper, JSON.stringify(BACKUP))
    await click(wrapper, 'Cancel')

    expect(wrapper.emitted('restore')).toBeUndefined()
  })

  it('clears a previous error when a good file is picked', async () => {
    const wrapper = mount(DataPanel)

    await pickFile(wrapper, 'not json')
    await pickFile(wrapper, JSON.stringify(BACKUP))

    expect(wrapper.text()).not.toContain("That file isn't valid JSON.")
  })

  describe('clear all data', () => {
    // Both dialogs are always mounted and both render a "Cancel", so scope the
    // lookup to the clear one rather than trusting template order.
    const clearDialog = (wrapper) => wrapper.findAllComponents(ConfirmDialog)[1]

    it('asks for confirmation instead of clearing straight away', async () => {
      const wrapper = mount(DataPanel)

      await click(wrapper, 'Clear all data')

      expect(wrapper.emitted('clear')).toBeUndefined()
      expect(wrapper.text()).toContain('Clear all data?')
      expect(wrapper.text()).toContain('It cannot be undone.')
    })

    it('emits clear once the dialog is confirmed', async () => {
      const wrapper = mount(DataPanel)

      await click(wrapper, 'Clear all data')
      await click(clearDialog(wrapper), 'Clear')

      expect(wrapper.emitted('clear')).toHaveLength(1)
    })

    it('does not emit clear when the dialog is cancelled', async () => {
      const wrapper = mount(DataPanel)

      await click(wrapper, 'Clear all data')
      await click(clearDialog(wrapper), 'Cancel')

      expect(wrapper.emitted('clear')).toBeUndefined()
    })
  })
})
