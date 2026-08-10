import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownChecklist from './MarkdownChecklist.vue'
import TaskModal from './TaskModal.vue'
import { parseChecklist } from '../lib/checklist.js'

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

  // Archiving is a Setup-only action.
  it('hides the archive button when editable is false', () => {
    const wrapper = mountChecklist({ modelValue: '- [x] send invoice', editable: false })
    expect(wrapper.find('.markdown-checklist__archive').exists()).toBe(false)
  })

  // What an active session uses: the full add/edit/delete kit, minus the sweep
  // that would strip checked lines out from under the session's own diff.
  it('keeps add/edit/delete but hides the archive button when archivable is false', () => {
    const wrapper = mountChecklist({
      modelValue: '- [ ] draft outline\n- [x] send invoice',
      archivable: false,
    })

    expect(wrapper.find('.markdown-checklist__add').exists()).toBe(true)
    expect(wrapper.find('.markdown-checklist__controls').exists()).toBe(true)
    expect(wrapper.findComponent(TaskModal).exists()).toBe(true)
    expect(wrapper.find('.markdown-checklist__archive').exists()).toBe(false)
  })

  describe('the add-task shortcut', () => {
    function press(key, target = window, init = {}) {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...init,
      })
      target.dispatchEvent(event)
      return event
    }

    const pressN = (target = window, init = {}) => press('n', target, init)

    it('opens the modal in add mode', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

      pressN()
      await wrapper.vm.$nextTick()

      const modal = wrapper.findComponent(TaskModal)
      expect(modal.props('open')).toBe(true)
      expect(modal.props('title')).toBe('Add Task')
      expect(modal.props('initialText')).toBe('')

      wrapper.unmount()
    })

    // Without this the modal's input, focused on open, receives the same
    // keystroke and the draft starts out as "n".
    it('swallows the keystroke so it does not land in the modal input', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

      const event = pressN()
      await wrapper.vm.$nextTick()

      expect(event.defaultPrevented).toBe(true)

      wrapper.unmount()
    })

    // The Capture box is on screen for the whole block, so a captured thought
    // starting with "n" must not open the modal — and the field must still
    // receive its "n", so the keystroke is left uncancelled.
    it('ignores the key when it comes from a text field', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      const event = pressN(textarea)
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(TaskModal).props('open')).toBe(false)
      expect(event.defaultPrevented).toBe(false)

      textarea.remove()
      wrapper.unmount()
    })

    it('leaves Cmd+N to the browser', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

      pressN(window, { metaKey: true })
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(TaskModal).props('open')).toBe(false)

      wrapper.unmount()
    })

    it('is not bound when editable is false', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline', editable: false })

      pressN()
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(TaskModal).exists()).toBe(false)

      wrapper.unmount()
    })

    it('removes the listener on unmount', () => {
      const remove = vi.spyOn(window, 'removeEventListener')
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

      wrapper.unmount()

      expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function))
      remove.mockRestore()
    })

    it('uses the configured key instead of the default', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline', shortcutKey: 't' })

      pressN()
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(TaskModal).props('open')).toBe(false)

      press('t')
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(TaskModal).props('open')).toBe(true)

      wrapper.unmount()
    })

    // Reads the prop at event time, so a change in Settings lands immediately.
    it('follows a key change without remounting', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline' })

      await wrapper.setProps({ shortcutKey: 'q' })
      press('q')
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(TaskModal).props('open')).toBe(true)

      wrapper.unmount()
    })

    it('does nothing when the key is blank', async () => {
      const wrapper = mountChecklist({ modelValue: '- [ ] draft outline', shortcutKey: '' })

      const event = pressN()
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(TaskModal).props('open')).toBe(false)
      expect(event.defaultPrevented).toBe(false)

      wrapper.unmount()
    })
  })

  describe('hiddenHashes', () => {
    const text = '- [x] send invoice\n- [ ] draft outline'
    const hiddenHashes = [parseChecklist(text)[0].hash]

    it('leaves the named lines out of the render', () => {
      const wrapper = mountChecklist({ modelValue: text, hiddenHashes })

      const items = wrapper.findAll('li')
      expect(items).toHaveLength(1)
      expect(items[0].find('label span').text()).toBe('draft outline')
    })

    // The filter is display-only: modelValue stays the whole list, so a toggle
    // must write back the hidden lines too rather than dropping them.
    it('still emits the full list, hidden lines included, on toggle', async () => {
      const wrapper = mountChecklist({ modelValue: text, hiddenHashes, editable: false })

      await wrapper.find('input[type="checkbox"]').setValue(true)

      expect(wrapper.emitted('update:modelValue')).toEqual([
        ['- [x] send invoice\n- [x] draft outline'],
      ])
    })
  })
})
