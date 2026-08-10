import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskModal from './TaskModal.vue'

// The native <dialog> methods are stubbed globally in src/test-setup.js.
describe('TaskModal', () => {
  it('seeds the input from initialText when opened', async () => {
    const wrapper = mount(TaskModal, {
      props: { open: false, initialText: 'draft outline' },
    })

    await wrapper.setProps({ open: true })
    expect(wrapper.find('input').element.value).toBe('draft outline')
  })

  it('emits the trimmed text on submit', async () => {
    const wrapper = mount(TaskModal, { props: { open: true } })

    await wrapper.find('input').setValue('  send invoice  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([['send invoice']])
  })

  it('disables Save and does not submit when the draft is empty or whitespace', async () => {
    const wrapper = mount(TaskModal, { props: { open: true } })

    const save = wrapper.find('button[type="submit"]')
    expect(save.attributes('disabled')).toBeDefined()

    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits close when Cancel is clicked', async () => {
    const wrapper = mount(TaskModal, { props: { open: true } })

    await wrapper.find('button[type="button"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close on the native dialog close event (Esc)', async () => {
    const wrapper = mount(TaskModal, { props: { open: true } })

    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  // What Escape actually fires in Chrome. Without it the parent's `open` stays
  // true while the dialog is shut, and nothing can reopen it.
  it('emits close on the native dialog cancel event (Esc)', async () => {
    const wrapper = mount(TaskModal, { props: { open: true } })

    await wrapper.find('dialog').trigger('cancel')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
