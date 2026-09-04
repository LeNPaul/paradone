import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DoneEntry from './DoneEntry.vue'

const field = (wrapper) => wrapper.find('input')

async function type(wrapper, text) {
  await field(wrapper).setValue(text)
  await field(wrapper).trigger('keydown.enter')
}

describe('DoneEntry', () => {
  it('reports what was typed on Enter, and clears the field', async () => {
    const wrapper = mount(DoneEntry, { props: { inputId: 'done' } })

    await type(wrapper, 'answered support mail')

    expect(wrapper.emitted('submit')).toEqual([['answered support mail']])
    expect(field(wrapper).element.value).toBe('')
  })

  it('trims the text', async () => {
    const wrapper = mount(DoneEntry, { props: { inputId: 'done' } })

    await type(wrapper, '  answered support mail  ')

    expect(wrapper.emitted('submit')).toEqual([['answered support mail']])
  })

  it('ignores Enter on an empty or whitespace field', async () => {
    const wrapper = mount(DoneEntry, { props: { inputId: 'done' } })

    await type(wrapper, '   ')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('takes one entry after another', async () => {
    const wrapper = mount(DoneEntry, { props: { inputId: 'done' } })

    await type(wrapper, 'answered support mail')
    await type(wrapper, 'fixed the build')

    expect(wrapper.emitted('submit')).toEqual([['answered support mail'], ['fixed the build']])
  })

  // Two screens render this control, so the id has to be theirs to set.
  it('labels the field with the id it was given', () => {
    const wrapper = mount(DoneEntry, { props: { inputId: 'active-done' } })

    expect(field(wrapper).attributes('id')).toBe('active-done')
    expect(wrapper.find('label').attributes('for')).toBe('active-done')
  })
})
