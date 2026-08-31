import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import { setActiveSession, setPrefs, getPrefs, setGoalsList, getGoalsList, getActiveSession, getArchive, setArchive, getSessions, setSessions } from './lib/storage.js'
import TimerDisplay from './components/TimerDisplay.vue'
import DataPanel from './components/DataPanel.vue'
import { DEFAULT_TITLE } from './lib/title.js'

beforeEach(() => {
  localStorage.clear()
  setPrefs({ workDuration: 25, breakDuration: 5 })
})

describe('setup', () => {
  it('shows the Setup screen with the primer button and Start button', () => {
    const wrapper = mount(App)
    expect(wrapper.find('#start-heading').exists()).toBe(true)
    expect(wrapper.text()).toContain('2-minute primer')
    expect(wrapper.get('button[type="button"]').exists()).toBe(true)
  })

  it('keeps the duration inputs out of Setup — they live behind the gear', () => {
    const wrapper = mount(App)
    expect(wrapper.find('#work-duration').exists()).toBe(false)
    expect(wrapper.find('#break-duration').exists()).toBe(false)
  })

  it('previews the configured block length in an unstarted ring', () => {
    const wrapper = mount(App)
    expect(wrapper.get('.timer-display__time').text()).toBe('25:00')
    expect(wrapper.get('.timer-display__label').text()).toBe('Ready')
    const circumference = 2 * Math.PI * 45
    expect(
      Number(wrapper.get('.timer-display__progress').attributes('stroke-dashoffset')),
    ).toBeCloseTo(circumference, 5)
  })

  it('follows the configured work duration', () => {
    setPrefs({ workDuration: 50, breakDuration: 5 })
    const wrapper = mount(App)
    expect(wrapper.get('.timer-display__time').text()).toBe('50:00')
  })

  it('clicking Start renders the Active section with a TimerDisplay', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    expect(wrapper.find('#active-heading').exists()).toBe(true)
    expect(wrapper.findComponent(TimerDisplay).exists()).toBe(true)
  })
})

describe('settings view', () => {
  function openSettings(wrapper) {
    return wrapper.findAll('button').find((b) => b.text() === 'Settings').trigger('click')
  }

  function activeSession() {
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
  }

  it('the gear opens the settings view over Setup, and Back returns', async () => {
    const wrapper = mount(App)
    await openSettings(wrapper)

    expect(wrapper.find('#settings-heading').exists()).toBe(true)
    expect(wrapper.get('#work-duration').element.value).toBe('25')
    expect(wrapper.get('#break-duration').element.value).toBe('5')
    expect(wrapper.find('#start-heading').exists()).toBe(false)

    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')
    expect(wrapper.find('#start-heading').exists()).toBe(true)
    expect(wrapper.find('#settings-heading').exists()).toBe(false)
  })

  it('editing a duration persists it to prefs', async () => {
    const wrapper = mount(App)
    await openSettings(wrapper)

    const work = wrapper.get('#work-duration')
    await work.setValue(50)
    await work.trigger('change')

    expect(getPrefs().workDuration).toBe(50)
    expect(getPrefs().breakDuration).toBe(5)
  })

  it('the new duration drives the next session', async () => {
    const wrapper = mount(App)
    await openSettings(wrapper)
    const work = wrapper.get('#work-duration')
    await work.setValue(50)
    await work.trigger('change')
    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')

    await wrapper.findAll('button').find((b) => b.text() === 'Start').trigger('click')
    expect(wrapper.findComponent(TimerDisplay).props('totalMs')).toBe(50 * 60 * 1000)
  })

  it('is reachable mid-session, replacing the timer until Back', async () => {
    activeSession()
    const wrapper = mount(App)
    await openSettings(wrapper)

    expect(wrapper.find('#settings-heading').exists()).toBe(true)
    expect(wrapper.find('#active-heading').exists()).toBe(false)

    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')
    expect(wrapper.find('#active-heading').exists()).toBe(true)
  })

  it('holds the theme toggle, which is not on any other screen', async () => {
    const wrapper = mount(App)
    expect(wrapper.findAll('button').map((b) => b.text())).not.toContain('Dark')

    await openSettings(wrapper)
    const dark = wrapper.findAll('button').find((b) => b.text() === 'Dark')
    expect(wrapper.findAll('button').map((b) => b.text())).toContain('Light')
    await dark.trigger('click')

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(getPrefs().theme).toBe('dark')
  })

  it('closes itself when the block ends, so the prompt is not swallowed', async () => {
    vi.useFakeTimers()
    try {
      activeSession()
      const wrapper = mount(App)
      await openSettings(wrapper)
      expect(wrapper.find('#settings-heading').exists()).toBe(true)

      await vi.advanceTimersByTimeAsync(25 * 60 * 1000 + 500)
      await flushPromises()

      expect(wrapper.find('#settings-heading').exists()).toBe(false)
      expect(wrapper.find('#block-end-heading').exists()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('primer setup', () => {
  // Clicking the primer affordance at Setup lands on the breakdown screen.
  async function openPrimerSetup(wrapper) {
    const primerButton = wrapper.findAll('button').find((b) => b.text().includes('2-minute primer'))
    await primerButton.trigger('click')
  }

  it('clicking the primer button asks for a 2-minute breakdown instead of starting the countdown', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)

    expect(wrapper.find('#primer-setup-heading').exists()).toBe(true)
    expect(wrapper.find('#primer-intent').exists()).toBe(true)
    expect(wrapper.find('#primer-heading').exists()).toBe(false)
  })

  it('"Start 2 minutes" stays disabled until the breakdown has real text', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)
    const startButton = () => wrapper.findAll('button').find((b) => b.text() === 'Start 2 minutes')

    expect(startButton().element.disabled).toBe(true)
    await wrapper.get('#primer-intent').setValue('   ')
    expect(startButton().element.disabled).toBe(true)
    await wrapper.get('#primer-intent').setValue('open the doc')
    expect(startButton().element.disabled).toBe(false)
  })

  it('starting the primer shows the countdown with the breakdown alongside it', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)
    await wrapper.get('#primer-intent').setValue('open the doc')
    await wrapper.findAll('button').find((b) => b.text() === 'Start 2 minutes').trigger('click')

    expect(wrapper.find('#primer-heading').exists()).toBe(true)
    expect(wrapper.get('section[aria-labelledby="primer-heading"]').text()).toContain('open the doc')
  })

  it('Back returns to Setup and discards the draft', async () => {
    const wrapper = mount(App)
    await openPrimerSetup(wrapper)
    await wrapper.get('#primer-intent').setValue('open the doc')
    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')

    expect(wrapper.find('#start-heading').exists()).toBe(true)
    await openPrimerSetup(wrapper)
    expect(wrapper.get('#primer-intent').element.value).toBe('')
  })

  it('shows the breakdown during the active block, and nothing when the session skipped the primer', () => {
    const timer = { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true }
    setActiveSession({ state: 'active', timer, primerIntent: 'open the doc' })
    expect(mount(App).get('section[aria-labelledby="active-heading"]').text()).toContain('open the doc')

    setActiveSession({ state: 'active', timer, primerIntent: '' })
    expect(mount(App).get('section[aria-labelledby="active-heading"]').text()).not.toContain('Primer:')
  })
})

// Add a task through the Add-Task modal, at Setup or during an active session.
async function addTaskViaModal(wrapper, text) {
  const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add Task'))
  await addButton.trigger('click')
  await wrapper.find('dialog input[type="text"]').setValue(text)
  await wrapper.find('dialog form').trigger('submit')
}

describe('adding to the Task List', () => {
  it('adding a task via the modal at Setup renders it as a clickable checkbox', async () => {
    const wrapper = mount(App)
    await addTaskViaModal(wrapper, 'draft outline')

    const taskListSection = wrapper.get('section[aria-labelledby="task-list-heading"]')
    expect(taskListSection.find('input[type="checkbox"]').exists()).toBe(true)
    expect(taskListSection.text()).toContain('draft outline')
  })

  it('an added task persists across a remount (reload)', async () => {
    const wrapper = mount(App)
    await addTaskViaModal(wrapper, 'draft outline')

    const reloaded = mount(App)
    const reloadedSection = reloaded.get('section[aria-labelledby="task-list-heading"]')
    expect(reloadedSection.find('input[type="checkbox"]').exists()).toBe(true)
    expect(reloadedSection.text()).toContain('draft outline')
  })

  it('Active state keeps the capture textarea out of the Task List section', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    const activeSection = wrapper.find('[aria-labelledby="active-heading"]')
    expect(activeSection.exists()).toBe(true)
    // The capture textarea lives in its own section, not in with the tasks.
    expect(activeSection.find('textarea').exists()).toBe(false)
    expect(activeSection.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('toggling a checkbox during an active session persists to the Task List storage', async () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.get('input[type="checkbox"]').setValue(true)

    expect(getGoalsList().text).toBe('- [x] draft outline')
  })
})

describe('adding tasks during an active session', () => {
  function startSession(text) {
    setGoalsList({ text, updatedAt: null })
    const wrapper = mount(App)
    return wrapper
      .findAll('button')
      .find((b) => b.text() === 'Start')
      .trigger('click')
      .then(() => wrapper)
  }

  const activeCheckboxes = (wrapper) =>
    wrapper.get('[aria-labelledby="active-heading"]').findAll('input[type="checkbox"]')

  const clickButton = (wrapper, label) =>
    wrapper
      .findAll('button')
      .find((b) => b.text() === label)
      .trigger('click')

  // Seed one pre-existing task, add a second mid-block, tick both.
  async function sessionWithBothKinds() {
    const wrapper = await startSession('- [ ] draft outline')
    await addTaskViaModal(wrapper, 'reply to Mai')
    await activeCheckboxes(wrapper)[0].setValue(true)
    await activeCheckboxes(wrapper)[1].setValue(true)
    return wrapper
  }

  it('offers add, edit and delete during a session, but not the archive sweep', async () => {
    const wrapper = await startSession('- [x] send invoice\n- [ ] draft outline')

    const activeSection = wrapper.get('[aria-labelledby="active-heading"]')
    expect(activeSection.find('.markdown-checklist__add').exists()).toBe(true)
    expect(activeSection.find('.markdown-checklist__controls').exists()).toBe(true)
    // Archiving strips checked lines out of the list, which would erase this
    // block's own completed-this-session diff. Setup-only.
    expect(activeSection.find('.markdown-checklist__archive').exists()).toBe(false)
  })

  it('persists a task added mid-session and lets it be ticked in the same block', async () => {
    const wrapper = await startSession('- [ ] draft outline')
    await addTaskViaModal(wrapper, 'reply to Mai')

    expect(getGoalsList().text).toBe('- [ ] draft outline\n- [ ] reply to Mai')
    expect(activeCheckboxes(wrapper)).toHaveLength(2)

    await activeCheckboxes(wrapper)[1].setValue(true)
    expect(getGoalsList().text).toBe('- [ ] draft outline\n- [x] reply to Mai')
  })

  it('a task added mid-session survives a reload mid-block, still ticked', async () => {
    const wrapper = await startSession('- [ ] draft outline')
    await addTaskViaModal(wrapper, 'reply to Mai')
    await activeCheckboxes(wrapper)[1].setValue(true)

    const reloaded = mount(App)
    const checkboxes = activeCheckboxes(reloaded)
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[1].element.checked).toBe(true)
    expect(reloaded.get('[aria-labelledby="active-heading"]').text()).toContain('reply to Mai')
  })

  it('badges the mid-session addition at the audit, but not the task that pre-existed the block', async () => {
    const wrapper = await sessionWithBothKinds()
    await clickButton(wrapper, 'Stop & log session')

    const items = wrapper.findAll('#audit-completed-heading ~ ul li')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('draft outline')
    expect(items[0].find('.task-badge').exists()).toBe(false)
    expect(items[1].text()).toContain('reply to Mai')
    expect(items[1].find('.task-badge').text()).toBe('added')
  })

  it('records the mid-session addition on the logged session', async () => {
    const wrapper = await sessionWithBothKinds()
    await clickButton(wrapper, 'Stop & log session')
    await clickButton(wrapper, 'Skip')

    const session = getSessions()[0]
    expect(session.completedTasks).toEqual(['draft outline', 'reply to Mai'])
    expect(session.addedTasks).toEqual(['reply to Mai'])
  })
})

describe('hiding already-completed tasks during a session', () => {
  function startSession(text) {
    setGoalsList({ text, updatedAt: null })
    const wrapper = mount(App)
    return wrapper
      .findAll('button')
      .find((b) => b.text() === 'Start')
      .trigger('click')
      .then(() => wrapper)
  }

  it('leaves tasks checked before Start out of the active list', async () => {
    const wrapper = await startSession('- [x] send invoice\n- [ ] draft outline')

    const activeSection = wrapper.get('[aria-labelledby="active-heading"]')
    expect(activeSection.text()).not.toContain('send invoice')
    expect(activeSection.text()).toContain('draft outline')
    expect(activeSection.findAll('input[type="checkbox"]')).toHaveLength(1)
  })

  it('keeps a task ticked during the block on screen, checked', async () => {
    const wrapper = await startSession('- [x] send invoice\n- [ ] draft outline')
    await wrapper.get('[aria-labelledby="active-heading"] input[type="checkbox"]').setValue(true)

    const checkboxes = wrapper
      .get('[aria-labelledby="active-heading"]')
      .findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(1)
    expect(checkboxes[0].element.checked).toBe(true)
  })

  // The hidden lines are filtered at render only, so a toggle must not drop them.
  it('keeps the hidden tasks in storage when a visible one is toggled', async () => {
    const wrapper = await startSession('- [x] send invoice\n- [ ] draft outline')
    await wrapper.get('[aria-labelledby="active-heading"] input[type="checkbox"]').setValue(true)

    expect(getGoalsList().text).toBe('- [x] send invoice\n- [x] draft outline')
  })

  it('shows the full list again back at Setup', async () => {
    const wrapper = await startSession('- [x] send invoice\n- [ ] draft outline')
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Stop & log session')
      .trigger('click')
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Skip')
      .trigger('click')
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Start new session')
      .trigger('click')

    const taskListSection = wrapper.get('section[aria-labelledby="task-list-heading"]')
    expect(taskListSection.text()).toContain('send invoice')
    expect(taskListSection.text()).toContain('draft outline')
  })
})

describe('pausing and stopping an active session', () => {
  function mountActive() {
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    return mount(App)
  }

  it('Active state renders Pause and Stop buttons', () => {
    const wrapper = mountActive()
    const buttonText = wrapper.findAll('button').map((b) => b.text())
    expect(buttonText).toContain('Pause')
    expect(buttonText).toContain('Stop & log session')
  })

  it('clicking Pause swaps the button to Resume', async () => {
    const wrapper = mountActive()
    const pauseButton = wrapper.findAll('button').find((b) => b.text() === 'Pause')
    await pauseButton.trigger('click')
    const buttonText = wrapper.findAll('button').map((b) => b.text())
    expect(buttonText).toContain('Resume')
    expect(buttonText).not.toContain('Pause')
  })

  it('clicking Stop transitions to the Audit screen', async () => {
    const wrapper = mountActive()
    const stopButton = wrapper.findAll('button').find((b) => b.text() === 'Stop & log session')
    await stopButton.trigger('click')
    expect(wrapper.find('#audit-heading').exists()).toBe(true)
  })
})

describe('block end', () => {
  function mountBlockEnd() {
    setActiveSession({
      state: 'blockEnd',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 25 * 60 * 1000, running: false },
    })
    return mount(App)
  }

  it('hides "Take a break" when breakDuration is 0, keeping the other two choices', () => {
    setPrefs({ workDuration: 25, breakDuration: 0 })
    const buttons = mountBlockEnd()
      .findAll('button')
      .map((b) => b.text())
    expect(buttons).not.toContain('Take a break')
    expect(buttons).toContain('Keep going')
    expect(buttons).toContain('End session')
  })

  it('offers break, keep going, and end session when breakDuration is greater than 0', () => {
    const buttons = mountBlockEnd()
      .findAll('button')
      .map((b) => b.text())
    expect(buttons).toContain('Take a break')
    expect(buttons).toContain('Keep going')
    expect(buttons).toContain('End session')
  })

  it('clicking Keep going starts another block, returning to the Active screen', async () => {
    const wrapper = mountBlockEnd()
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Keep going')
      .trigger('click')
    expect(wrapper.find('#block-end-heading').exists()).toBe(false)
    expect(wrapper.find('#active-task-list-heading').exists()).toBe(true)
    expect(wrapper.text()).toContain('25:00')
  })

  it('reads "Break complete" when the block end was reached from a break', () => {
    setActiveSession({
      state: 'blockEnd',
      afterBreak: true,
      timer: { durationMs: 5 * 60 * 1000, startedAt: Date.now(), elapsedMs: 5 * 60 * 1000, running: false },
    })
    const wrapper = mount(App)
    expect(wrapper.find('#block-end-heading').text()).toBe('Break complete')
    expect(wrapper.text()).toContain('Take another break, keep going, or wrap up?')
  })

  it('reads "Block complete" when a work block ran out', () => {
    const wrapper = mountBlockEnd()
    expect(wrapper.find('#block-end-heading').text()).toBe('Block complete')
    expect(wrapper.text()).toContain('Take the break, keep going, or wrap up?')
  })

  it('clicking End session transitions to the Audit screen', async () => {
    const wrapper = mountBlockEnd()
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'End session')
      .trigger('click')
    expect(wrapper.find('#block-end-heading').exists()).toBe(false)
    expect(wrapper.find('#audit-heading').exists()).toBe(true)
  })
})

describe('break', () => {
  function mountBreak() {
    setActiveSession({
      state: 'break',
      timer: { durationMs: 5 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    return mount(App)
  }

  it('renders an End break button', () => {
    const wrapper = mountBreak()
    expect(wrapper.findAll('button').map((b) => b.text())).toContain('End break')
  })

  it('clicking End break returns to the block-end choice', async () => {
    const wrapper = mountBreak()
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'End break')
      .trigger('click')
    expect(wrapper.find('#break-heading').exists()).toBe(false)
    expect(wrapper.find('#block-end-heading').text()).toBe('Break complete')
  })
})

// The break offered once the audit is done. The session is already logged, so
// there is nothing to chain onto and it drops back to Setup.
describe('a break taken from the summary', () => {
  function mountSummary() {
    setActiveSession({
      state: 'summary',
      timer: null,
      capture: 'reply to Mai',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got it done',
      sessionStartedAt: Date.now(),
    })
    return mount(App)
  }

  function takeBreak(wrapper) {
    return wrapper
      .findAll('button')
      .find((b) => b.text() === 'Take a break')
      .trigger('click')
  }

  it('offers "Take a break" beside "Start new session"', () => {
    const buttons = mountSummary()
      .findAll('button')
      .map((b) => b.text())
    expect(buttons).toContain('Take a break')
    expect(buttons).toContain('Start new session')
  })

  it('hides "Take a break" when breakDuration is 0', () => {
    setPrefs({ workDuration: 25, breakDuration: 0 })
    const buttons = mountSummary()
      .findAll('button')
      .map((b) => b.text())
    expect(buttons).not.toContain('Take a break')
    expect(buttons).toContain('Start new session')
  })

  it('starts the break countdown', async () => {
    const wrapper = mountSummary()
    await takeBreak(wrapper)
    expect(wrapper.find('#break-heading').exists()).toBe(true)
    expect(wrapper.find('#summary-heading').exists()).toBe(false)
  })

  // Anything typed there would go nowhere: the session it belonged to is closed,
  // and the capture is cleared on the way back to Setup.
  it('hides the capture box, unlike a mid-session break', async () => {
    const wrapper = mountSummary()
    await takeBreak(wrapper)
    expect(wrapper.find('#capture-heading').exists()).toBe(false)
  })

  it('returns to Setup on End break, with the Task List preserved', async () => {
    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    const wrapper = mountSummary()
    await takeBreak(wrapper)
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'End break')
      .trigger('click')

    expect(wrapper.find('#break-heading').exists()).toBe(false)
    expect(wrapper.find('#block-end-heading').exists()).toBe(false)
    expect(wrapper.find('#start-heading').exists()).toBe(true)
    expect(wrapper.get('section[aria-labelledby="task-list-heading"]').text()).toContain(
      'draft outline',
    )
  })
})

describe('focused time so far', () => {
  it('shows the session total under the running timer', () => {
    setActiveSession({
      state: 'active',
      timer: {
        durationMs: 25 * 60 * 1000,
        startedAt: Date.now() - 10 * 60 * 1000,
        elapsedMs: 0,
        running: true,
      },
      actualDurationMs: 65 * 60 * 1000,
    })
    expect(mount(App).text()).toContain('1h 15m focused so far')
  })

  it('shows the session total at the block-end choice', () => {
    setActiveSession({
      state: 'blockEnd',
      timer: {
        durationMs: 25 * 60 * 1000,
        startedAt: Date.now(),
        elapsedMs: 25 * 60 * 1000,
        running: false,
      },
      actualDurationMs: 75 * 60 * 1000,
    })
    expect(mount(App).text()).toContain('1h 15m focused so far')
  })

  it('is not shown during a break', () => {
    setActiveSession({
      state: 'break',
      timer: { durationMs: 5 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
      actualDurationMs: 75 * 60 * 1000,
    })
    expect(mount(App).text()).not.toContain('focused so far')
  })
})

describe('capture box', () => {
  it.each(['primer', 'active', 'break'])('is shown while state is %s', (state) => {
    setActiveSession({
      state,
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    expect(wrapper.find('#capture-heading').exists()).toBe(true)
  })

  it.each(['setup', 'blockEnd', 'audit', 'summary'])('is hidden while state is %s', (state) => {
    setActiveSession(
      state === 'setup'
        ? null
        : {
            state,
            timer: null,
            capture: '',
            usedPrimer: false,
            auditProductive: state === 'summary' ? 'focused' : '',
            auditNotes: '',
            sessionStartedAt: Date.now(),
          },
    )
    const wrapper = mount(App)
    expect(wrapper.find('#capture-heading').exists()).toBe(false)
  })

  it('typing into the capture textarea during an active block persists to the session', async () => {
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.find('textarea[aria-label="Capture"]').setValue('reply to Mai')
    await nextTick()
    expect(getActiveSession().capture).toBe('reply to Mai')
  })
})

describe('audit and summary', () => {
  it('opens the audit and the summary with the session\'s focused time', () => {
    const session = {
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: '',
      sessionStartedAt: Date.now(),
      actualDurationMs: 75 * 60 * 1000,
    }
    setActiveSession({ ...session, state: 'audit' })
    expect(mount(App).text()).toContain('1h 15m focused')

    setActiveSession({ ...session, state: 'summary' })
    expect(mount(App).text()).toContain('1h 15m focused')
  })

  it('shows the audit prompt with the current Task List and session captures when state is audit', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: 'tabbed out to check email',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    expect(wrapper.find('#audit-heading').exists()).toBe(true)
    expect(wrapper.text()).toContain('draft outline')
    expect(wrapper.text()).toContain('tabbed out to check email')
  })

  it('reports only the tasks ticked during the block, from Start through to the summary export', async () => {
    setGoalsList({ text: '- [x] send invoice\n- [ ] draft outline', updatedAt: null })
    const wrapper = mount(App)

    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')

    // The first task was already done before the block began, so it is hidden
    // from the active list — the only checkbox on screen is "draft outline".
    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)
    const stopButton = wrapper.findAll('button').find((b) => b.text() === 'Stop & log session')
    await stopButton.trigger('click')

    const completed = wrapper.findAll('#audit-completed-heading ~ ul li').map((li) => li.text())
    expect(completed).toEqual(['draft outline'])

    await wrapper.findAll('input[type="radio"]')[0].setValue()
    const continueButton = wrapper.findAll('button').find((b) => b.text() === 'Continue')
    await continueButton.trigger('click')

    expect(wrapper.find('#summary-heading').exists()).toBe(true)
    const summarised = wrapper.findAll('#summary-completed-heading ~ ul li').map((li) => li.text())
    expect(summarised).toEqual(['draft outline'])
  })

  it('counts a task ticked at the audit as completed, from the tick through to the log', async () => {
    setGoalsList({ text: '- [ ] send invoice\n- [ ] draft outline', updatedAt: null })
    const wrapper = mount(App)

    await wrapper.findAll('button').find((b) => b.text() === 'Start').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Stop & log session').trigger('click')

    // Nothing was ticked during the block, so both tasks are on the audit list.
    const boxes = wrapper.findAll('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')
    expect(boxes).toHaveLength(2)
    await boxes[0].trigger('change')

    // Deferred: the tick is held in the audit's draft until the audit is done.
    expect(getGoalsList().text).toBe('- [ ] send invoice\n- [ ] draft outline')

    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await wrapper.findAll('button').find((b) => b.text() === 'Continue').trigger('click')

    expect(getGoalsList().text).toBe('- [x] send invoice\n- [ ] draft outline')
    const summarised = wrapper.findAll('#summary-completed-heading ~ ul li').map((li) => li.text())
    expect(summarised).toEqual(['send invoice'])
    expect(getSessions()[0].completedTasks).toEqual(['send invoice'])
  })

  it('counts a task added and ticked at the audit, from the add through to the log', async () => {
    setGoalsList({ text: '- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)

    await wrapper.findAll('button').find((b) => b.text() === 'Start').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Stop & log session').trigger('click')

    await addTaskViaModal(wrapper, 'reply to Mai')

    // Deferred like a tick: the addition is held in the audit's draft.
    expect(getGoalsList().text).toBe('- [ ] send invoice')

    const boxes = wrapper.findAll('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')
    expect(boxes).toHaveLength(2)
    await boxes[1].trigger('change')

    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await wrapper.findAll('button').find((b) => b.text() === 'Continue').trigger('click')

    expect(getGoalsList().text).toBe('- [ ] send invoice\n- [x] reply to Mai')
    const summarised = wrapper.findAll('#summary-completed-heading ~ ul li')
    expect(summarised.map((li) => li.text())).toEqual(['reply to Maiadded'])
    expect(summarised[0].find('.task-badge').text()).toBe('added')
    expect(getSessions()[0].completedTasks).toEqual(['reply to Mai'])
    expect(getSessions()[0].addedTasks).toEqual(['reply to Mai'])
  })

  it('keeps a task deleted at the audit off the list once the audit is finished', async () => {
    setGoalsList({ text: '- [ ] send invoice\n- [ ] draft outline', updatedAt: null })
    const wrapper = mount(App)

    await wrapper.findAll('button').find((b) => b.text() === 'Start').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Stop & log session').trigger('click')

    await wrapper
      .findAll('[aria-labelledby="audit-goal-heading"] button[aria-label="Delete task"]')[0]
      .trigger('click')
    expect(getGoalsList().text).toBe('- [ ] send invoice\n- [ ] draft outline')

    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await wrapper.findAll('button').find((b) => b.text() === 'Continue').trigger('click')

    expect(getGoalsList().text).toBe('- [ ] draft outline')
  })

  it('keeps a task ticked at the audit ticked when the session is discarded', async () => {
    setGoalsList({ text: '- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)

    await wrapper.findAll('button').find((b) => b.text() === 'Start').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Stop & log session').trigger('click')
    await wrapper
      .find('[aria-labelledby="audit-goal-heading"] input[type="checkbox"]')
      .trigger('change')

    await wrapper.findAll('button').find((b) => b.text() === 'Discard session').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Discard').trigger('click')

    // The block is thrown away; the checked box is work state and survives it.
    expect(wrapper.find('#start-heading').exists()).toBe(true)
    expect(getSessions()).toEqual([])
    expect(getGoalsList().text).toBe('- [x] send invoice')
  })

  it('submitting the audit prompt transitions to the summary screen', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    const continueButton = wrapper.findAll('button').find((b) => b.text() === 'Continue')
    await continueButton.trigger('click')
    expect(wrapper.find('#summary-heading').exists()).toBe(true)
  })

  it('skipping the audit prompt transitions to the summary screen', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const skipButton = wrapper.findAll('button').find((b) => b.text() === 'Skip')
    await skipButton.trigger('click')
    expect(wrapper.find('#summary-heading').exists()).toBe(true)
  })

  it('discarding the session returns to Setup with nothing logged and the Task List untouched', async () => {
    setGoalsList({ text: '- [x] send invoice\n- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: 'tabbed out to check email',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    await wrapper.findAll('button').find((b) => b.text() === 'Discard session').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Discard').trigger('click')

    expect(wrapper.find('#start-heading').exists()).toBe(true)
    expect(getSessions()).toEqual([])
    expect(getActiveSession()).toBeNull()
    expect(getGoalsList().text).toBe('- [x] send invoice\n- [ ] draft outline')
  })

  it('rendering the summary screen shows the capture text and audit answers, but not the Task List', () => {
    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    setActiveSession({
      state: 'summary',
      timer: null,
      capture: 'reply to Mai',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got it done',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const text = wrapper.text()
    expect(text).toContain('reply to Mai')
    expect(text).toContain('got it done')
    // The summary recaps the block, not the standing list.
    expect(wrapper.find('#summary-tasks-heading').exists()).toBe(false)
    expect(text).not.toContain('draft outline')
  })

  it('clicking "Start new session" returns to Setup with the Task List preserved (not reset)', async () => {
    setGoalsList({ text: '- [x] draft outline', updatedAt: null })
    setActiveSession({
      state: 'summary',
      timer: null,
      capture: 'reply to Mai',
      usedPrimer: false,
      auditProductive: 'focused',
      auditNotes: 'got it done',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    const startNewButton = wrapper.findAll('button').find((b) => b.text() === 'Start new session')
    await startNewButton.trigger('click')

    expect(wrapper.find('#task-list-heading').exists()).toBe(true)
    const taskListSection = wrapper.get('section[aria-labelledby="task-list-heading"]')
    expect(taskListSection.find('input[type="checkbox"]').element.checked).toBe(true)
    expect(taskListSection.text()).toContain('draft outline')
  })
})

describe('audit log', () => {
  it('clicking "View log" replaces Setup with the log screen', async () => {
    const wrapper = mount(App)
    const viewLogButton = wrapper.findAll('button').find((b) => b.text() === 'View log')
    await viewLogButton.trigger('click')

    expect(wrapper.find('#log-heading').exists()).toBe(true)
    expect(wrapper.find('#task-list-heading').exists()).toBe(false)
    expect(wrapper.find('#start-heading').exists()).toBe(false)
  })

  it('clicking Back returns to Setup', async () => {
    const wrapper = mount(App)
    await wrapper.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Back').trigger('click')

    expect(wrapper.find('#log-heading').exists()).toBe(false)
    expect(wrapper.find('#task-list-heading').exists()).toBe(true)
  })

  it('shows an audit completed in this session, without a reload', async () => {
    setActiveSession({
      state: 'audit',
      timer: null,
      capture: '',
      usedPrimer: false,
      auditProductive: '',
      auditNotes: '',
      sessionStartedAt: Date.now(),
    })
    const wrapper = mount(App)
    await wrapper.findAll('input[type="radio"]')[0].setValue()
    await wrapper.findAll('button').find((b) => b.text() === 'Continue').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Start new session').trigger('click')

    await wrapper.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    expect(wrapper.findAll('.session-log__entry')).toHaveLength(1)
  })

  it('reports an empty log when no audits have been recorded', async () => {
    const wrapper = mount(App)
    await wrapper.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    expect(wrapper.text()).toContain('No audits logged yet.')
  })

  it('"Clear log" empties the log once confirmed, and it stays empty on reload', async () => {
    setSessions([
      {
        id: 'a',
        date: '2026-08-01T13:50:00.000Z',
        auditedAt: '2026-08-01T14:15:00.000Z',
        plannedDuration: 25,
        actualDuration: 25,
        auditProductive: 'focused',
        auditNotes: '',
      },
    ])
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const wrapper = mount(App)
    const click = (label) =>
      wrapper.findAll('button').find((b) => b.text() === label).trigger('click')

    await click('View log')
    await click('Clear log')
    expect(getSessions()).toHaveLength(1) // not until it's confirmed
    await click('Clear')

    expect(getSessions()).toEqual([])
    expect(wrapper.text()).toContain('No audits logged yet.')
    expect(getGoalsList().text).toBe('- [ ] draft outline')

    const reloaded = mount(App)
    await reloaded.findAll('button').find((b) => b.text() === 'View log').trigger('click')
    expect(reloaded.text()).toContain('No audits logged yet.')
  })
})

describe('archiving completed tasks', () => {
  function clickButton(wrapper, label) {
    return wrapper.findAll('button').find((b) => b.text() === label).trigger('click')
  }

  function archiveButton(wrapper) {
    return wrapper.findAll('button').find((b) => b.text().startsWith('Archive completed'))
  }

  it('sweeps checked tasks off the list, leaving unchecked ones, and persists', async () => {
    setGoalsList({ text: '- [ ] draft outline\n- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)
    await wrapper.findAll('input[type="checkbox"]')[1].setValue(true)

    await archiveButton(wrapper).trigger('click')

    expect(getGoalsList().text).toBe('- [ ] draft outline')
    expect(getArchive().archived.map((e) => e.text)).toEqual(['send invoice'])
    expect(wrapper.get('section[aria-labelledby="task-list-heading"]').text()).not.toContain(
      'send invoice',
    )
  })

  it('offers no archive button when nothing is checked', () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    const wrapper = mount(App)
    expect(archiveButton(wrapper)).toBeUndefined()
  })

  // The whole point of the timestamp: it records the tick, not the sweep.
  it('records the time a task was ticked, surviving a reload before archiving', async () => {
    setGoalsList({ text: '- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)
    await wrapper.get('input[type="checkbox"]').setValue(true)
    const tickedAt = getArchive().completedAt['send invoice']
    expect(tickedAt).toBeTruthy()

    const reloaded = mount(App)
    await archiveButton(reloaded).trigger('click')

    const entry = getArchive().archived[0]
    expect(entry.completedAt).toBe(tickedAt)
    expect(entry.archivedAt).not.toBe(entry.completedAt)
  })

  it('forgets the tick time when a task is unticked before archiving', async () => {
    setGoalsList({ text: '- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)
    // Re-query between toggles: the row's key is a hash of the line, so ticking
    // it replaces the element and the first handle goes stale.
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('input[type="checkbox"]').setValue(false)

    expect(getGoalsList().text).toBe('- [ ] send invoice')
    expect(getArchive().completedAt).toEqual({})
  })

  it('records a tick made during an active session', async () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: null })
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await wrapper.get('input[type="checkbox"]').setValue(true)

    expect(getArchive().completedAt['draft outline']).toBeTruthy()
  })

  it('"View archive" replaces Setup and lists archived tasks, Back returns', async () => {
    setGoalsList({ text: '- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await archiveButton(wrapper).trigger('click')

    await clickButton(wrapper, 'View archive')
    expect(wrapper.find('#archive-heading').exists()).toBe(true)
    expect(wrapper.find('#task-list-heading').exists()).toBe(false)
    expect(wrapper.text()).toContain('send invoice')

    await clickButton(wrapper, 'Back')
    expect(wrapper.find('#archive-heading').exists()).toBe(false)
    expect(wrapper.find('#task-list-heading').exists()).toBe(true)
  })

  it('reports an empty archive when nothing has been archived', async () => {
    const wrapper = mount(App)
    await clickButton(wrapper, 'View archive')
    expect(wrapper.text()).toContain('No tasks archived yet.')
  })

  it('"Clear archive" drops swept tasks once confirmed, keeping tick times for live ones', async () => {
    setGoalsList({ text: '- [ ] draft outline\n- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)
    await wrapper.findAll('input[type="checkbox"]')[1].setValue(true)
    await archiveButton(wrapper).trigger('click')
    // A task ticked but not yet swept: its tick time must survive the clear.
    await wrapper.get('input[type="checkbox"]').setValue(true)
    const tickedAt = getArchive().completedAt['draft outline']

    await clickButton(wrapper, 'View archive')
    await clickButton(wrapper, 'Clear archive')
    expect(getArchive().archived).toHaveLength(1) // not until it's confirmed
    await clickButton(wrapper, 'Clear')

    expect(getArchive().archived).toEqual([])
    expect(getArchive().completedAt['draft outline']).toBe(tickedAt)
    expect(getGoalsList().text).toBe('- [x] draft outline')
    expect(wrapper.text()).toContain('No tasks archived yet.')

    const reloaded = mount(App)
    await clickButton(reloaded, 'View archive')
    expect(reloaded.text()).toContain('No tasks archived yet.')
  })

  it('leaves the archive alone when the clear dialog is cancelled', async () => {
    setGoalsList({ text: '- [ ] send invoice', updatedAt: null })
    const wrapper = mount(App)
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await archiveButton(wrapper).trigger('click')

    await clickButton(wrapper, 'View archive')
    await clickButton(wrapper, 'Clear archive')
    await clickButton(wrapper, 'Cancel')

    expect(getArchive().archived).toHaveLength(1)
    expect(wrapper.text()).toContain('send invoice')
  })

  // The archive view is a view toggle, not a machine state — it must never
  // rehydrate the user into it.
  it('does not write the archive view into the active session', async () => {
    const wrapper = mount(App)
    await clickButton(wrapper, 'View archive')
    expect(getActiveSession()).toBeNull()
  })
})

describe('interval wiring', () => {
  it('auto-transitions active -> blockEnd as real time passes', async () => {
    vi.useFakeTimers()
    try {
      const startedAt = Date.now()
      setActiveSession({
        state: 'active',
        timer: { durationMs: 25 * 60 * 1000, startedAt, elapsedMs: 0, running: true },
      })
      const wrapper = mount(App)
      expect(wrapper.find('#active-heading').exists()).toBe(true)

      await vi.advanceTimersByTimeAsync(25 * 60 * 1000 + 500)
      await flushPromises()

      expect(wrapper.find('#block-end-heading').exists()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('browser tab title', () => {
  it('is the default title at Setup', () => {
    mount(App)
    expect(document.title).toBe(DEFAULT_TITLE)
  })

  it('counts down in the tab while a session is active', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    expect(document.title).toMatch(/^⏱ \d{2}:\d{2} Focus — Paradone$/)
  })

  it('marks the tab as paused', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    const pauseButton = wrapper.findAll('button').find((b) => b.text() === 'Pause')
    await pauseButton.trigger('click')
    expect(document.title).toMatch(/^⏸ \d{2}:\d{2} Focus — Paradone$/)
  })

  it('reverts to the default title once the session stops', async () => {
    const wrapper = mount(App)
    const startButton = wrapper.findAll('button').find((b) => b.text() === 'Start')
    await startButton.trigger('click')
    const stopButton = wrapper.findAll('button').find((b) => b.text() === 'Stop & log session')
    await stopButton.trigger('click')
    expect(document.title).toBe(DEFAULT_TITLE)
  })
})

describe('data export and restore', () => {
  function openSettings(wrapper) {
    return wrapper.findAll('button').find((b) => b.text() === 'Settings').trigger('click')
  }

  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  // The reload tests stub window.location — put it back so nothing downstream
  // inherits a fake one.
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('puts the Data block in settings and nowhere else', async () => {
    const wrapper = mount(App)
    expect(wrapper.find('#data-heading').exists()).toBe(false)

    await openSettings(wrapper)

    expect(wrapper.find('#data-heading').exists()).toBe(true)
    const labels = wrapper.findAll('button').map((b) => b.text())
    expect(labels).toContain('Export data')
    expect(labels).toContain('Import data')
    expect(labels).toContain('Clear all data')
  })

  it('exports every entity as a dated JSON file', async () => {
    setGoalsList({ text: '- [ ] draft outline', updatedAt: '2026-08-05T09:00:00.000Z' })
    const created = vi.spyOn(document, 'createElement')
    const wrapper = mount(App)
    await openSettings(wrapper)

    await wrapper.findAll('button').find((b) => b.text() === 'Export data').trigger('click')

    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('application/json')
    const link = created.mock.results.find((r) => r.value instanceof HTMLAnchorElement).value
    expect(link.download).toMatch(/^paradone-backup-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('restoring writes every entity and reloads to re-hydrate', async () => {
    const reload = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ reload })

    setGoalsList({ text: 'old list', updatedAt: null })
    const wrapper = mount(App)
    await openSettings(wrapper)

    wrapper.findComponent(DataPanel).vm.$emit('restore', {
      prefs: { workDuration: 50, breakDuration: 10, theme: 'dark' },
      goalsList: { text: '- [ ] restored task', updatedAt: '2026-08-05T09:00:00.000Z' },
      sessions: [{ id: 'abc-123', auditProductive: 'focused' }],
      archive: { completedAt: {}, archived: [{ id: 'def', text: 'book flights' }] },
    })
    await nextTick()

    expect(getGoalsList().text).toBe('- [ ] restored task')
    expect(getPrefs().workDuration).toBe(50)
    expect(getSessions()).toHaveLength(1)
    expect(getArchive().archived).toHaveLength(1)
    expect(reload).toHaveBeenCalled()
  })

  it('restoring drops any session in progress', async () => {
    const reload = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ reload })

    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    const wrapper = mount(App)
    await openSettings(wrapper)

    wrapper.findComponent(DataPanel).vm.$emit('restore', {
      prefs: { workDuration: 25, breakDuration: 5 },
      goalsList: { text: '', updatedAt: null },
      sessions: [],
      archive: { completedAt: {}, archived: [] },
    })
    await nextTick()

    expect(getActiveSession()).toBeNull()
  })

  it('clearing wipes every entity and reloads to a factory-fresh app', async () => {
    const reload = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ reload })

    setPrefs({ workDuration: 50, breakDuration: 10, theme: 'dark' })
    setGoalsList({ text: '- [ ] draft outline', updatedAt: '2026-08-05T09:00:00.000Z' })
    setSessions([{ id: 'abc-123', auditProductive: 'focused' }])
    setActiveSession({
      state: 'active',
      timer: { durationMs: 25 * 60 * 1000, startedAt: Date.now(), elapsedMs: 0, running: true },
    })
    setArchive({ completedAt: {}, archived: [{ id: 'def', text: 'book flights' }] })

    const wrapper = mount(App)
    await openSettings(wrapper)

    wrapper.findComponent(DataPanel).vm.$emit('clear')
    await nextTick()

    expect(getPrefs()).toEqual({ workDuration: 25, breakDuration: 5, addTaskKey: 'n', sound: true, notify: false })
    expect(getGoalsList()).toEqual({ text: '', updatedAt: null })
    expect(getSessions()).toEqual([])
    expect(getActiveSession()).toBeNull()
    expect(getArchive()).toEqual({ completedAt: {}, archived: [] })
    expect(reload).toHaveBeenCalled()
  })
})
