import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

// The native <dialog> methods are stubbed globally in src/test-setup.js. They
// live on the prototype, so reset the call count between tests.
beforeEach(() => {
  vi.mocked(HTMLDialogElement.prototype.showModal).mockClear()
})

describe('ConfirmDialog', () => {
  it('opens the native dialog when open flips true', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: false } })
    const dialog = wrapper.find('dialog').element

    await wrapper.setProps({ open: true })
    expect(dialog.showModal).toHaveBeenCalled()
  })

  it('renders the title, message and confirm label', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Clear archive?',
        message: 'This permanently deletes 2 archived tasks. It cannot be undone.',
        confirmLabel: 'Clear',
      },
    })

    expect(wrapper.text()).toContain('Clear archive?')
    expect(wrapper.text()).toContain('This permanently deletes 2 archived tasks.')
    expect(wrapper.find('.btn-primary').text()).toBe('Clear')
  })

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: true } })

    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close when Cancel is clicked', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: true } })

    await wrapper.find('.btn-quiet').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('emits close on the native dialog close event (Esc)', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: true } })

    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
