import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownChecklist from './MarkdownChecklist.vue'
import TaskModal from './TaskModal.vue'

// TaskModal wraps a native <dialog>, whose showModal()/close() jsdom does not
// implement. Stub it so we can drive the add/edit flow through its props/emits.
function mountChecklist(props) {
  return mount(MarkdownChecklist, {
    props,
    global: { stubs: { TaskModal: true } },
  })
}

describe('MarkdownChecklist', () => {
  it('renders a checkbox input for checkbox lines and plain text for non-checkbox lines', () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- [x] send invoice\n- ideas for post',
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0].element.checked).toBe(false)
    expect(checkboxes[1].element.checked).toBe(true)

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[2].find('span').text()).toBe('- ideas for post')
    expect(items[2].find('input').exists()).toBe(false)
  })

  it('renders no item rows for an empty list', () => {
    const wrapper = mountChecklist({ modelValue: '' })
    expect(wrapper.findAll('li')).toHaveLength(0)
    // The Add Task button is still available to seed the first task.
    expect(wrapper.find('.markdown-checklist__add').exists()).toBe(true)
  })

  it('strips the marker so a checkbox line label shows only the task text', () => {
    const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })
    expect(wrapper.find('label span').text()).toBe('draft outline')
  })

  it('emits update:modelValue with the toggled line on checkbox click', async () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- [x] send invoice',
    })

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([
      '- [x] draft outline\n- [x] send invoice',
    ])
  })

  it('only rewrites the toggled line, leaving the rest of the string untouched', async () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- ideas for post\n- [x] send invoice',
    })

    await wrapper.findAll('input[type="checkbox"]')[1].setValue(false)

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([
      '- [ ] draft outline\n- ideas for post\n- [ ] send invoice',
    ])
  })

  it('reflects a re-passed modelValue prop instead of holding local checked state', async () => {
    const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

    await wrapper.setProps({ modelValue: '- [x] draft outline' })

    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true)
  })

  it('opens the modal in add mode and appends the new task on submit', async () => {
    const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

    await wrapper.find('.markdown-checklist__add').trigger('click')

    const modal = wrapper.findComponent(TaskModal)
    expect(modal.props('open')).toBe(true)
    expect(modal.props('title')).toBe('Add Task')
    expect(modal.props('initialText')).toBe('')

    modal.vm.$emit('submit', 'send invoice')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([
      '- [ ] draft outline\n- [ ] send invoice',
    ])
  })

  it('opens the modal in edit mode prefilled and rewrites the task on submit', async () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- [x] send invoice',
    })

    await wrapper.findAll('.markdown-checklist__controls button')[0].trigger('click')

    const modal = wrapper.findComponent(TaskModal)
    expect(modal.props('open')).toBe(true)
    expect(modal.props('title')).toBe('Edit Task')
    expect(modal.props('initialText')).toBe('draft outline')

    modal.vm.$emit('submit', 'draft full outline')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([
      '- [ ] draft full outline\n- [x] send invoice',
    ])
  })

  it('emits the list with the task removed when delete is clicked', async () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- [x] send invoice',
    })

    // Each row's controls are [Edit, Delete]; index 1 is delete on the first row.
    await wrapper.findAll('.markdown-checklist__controls button')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['- [x] send invoice'])
  })

  it('renders no add/edit/delete controls when editable is false, but still toggles', async () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline',
      editable: false,
    })

    expect(wrapper.find('.markdown-checklist__add').exists()).toBe(false)
    expect(wrapper.find('.markdown-checklist__controls').exists()).toBe(false)
    expect(wrapper.findComponent(TaskModal).exists()).toBe(false)

    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['- [x] draft outline']])
  })

  it('emits archive when the archive button is clicked, labelled with the checked count', async () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- [x] send invoice\n- [x] book flights',
    })

    const button = wrapper.find('.markdown-checklist__archive')
    expect(button.text()).toBe('Archive completed (2)')

    await button.trigger('click')
    expect(wrapper.emitted('archive')).toHaveLength(1)
  })

  it('hides the archive button when nothing is checked', () => {
    const wrapper = mountChecklist({ modelValue: '- [ ] draft outline\n- ideas for post' })
    expect(wrapper.find('.markdown-checklist__archive').exists()).toBe(false)
  })

  // Archiving is a Setup-only action; during a session the list is toggle-only.
  it('hides the archive button when editable is false', () => {
    const wrapper = mountChecklist({ modelValue: '- [x] send invoice', editable: false })
    expect(wrapper.find('.markdown-checklist__archive').exists()).toBe(false)
  })
})
