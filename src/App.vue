<script setup>
import { ref, computed } from 'vue'
import MarkdownChecklist from './components/MarkdownChecklist.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import CaptureBox from './components/CaptureBox.vue'
import AuditPrompt from './components/AuditPrompt.vue'
import SessionSummary from './components/SessionSummary.vue'
import SessionLog from './components/SessionLog.vue'
import ArchiveView from './components/ArchiveView.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { getGoalsList, setGoalsList, getSessions, getArchive, setArchive } from './lib/storage.js'
import { completedSince } from './lib/checklist.js'
import { syncCompletions, archiveChecked } from './lib/archive.js'
import { useSessionMachine } from './composables/useSessionMachine.js'
import { useDocumentTitle } from './composables/useDocumentTitle.js'

const taskListText = ref(getGoalsList().text)
const archive = ref(getArchive())

// The single funnel for every Task List write (Setup and Active both route
// here), so no checkbox tick escapes the completion-time bookkeeping.
function onTaskListUpdate(text) {
  const now = new Date().toISOString()
  archive.value = {
    ...archive.value,
    completedAt: syncCompletions(archive.value.completedAt, taskListText.value, text, now),
  }
  setArchive(archive.value)
  taskListText.value = text
  setGoalsList({ text, updatedAt: now })
}

function onArchiveCompleted() {
  const result = archiveChecked(taskListText.value, archive.value, new Date().toISOString())
  archive.value = result.archive
  setArchive(archive.value)
  taskListText.value = result.taskListText
  setGoalsList({ text: result.taskListText, updatedAt: new Date().toISOString() })
}

// The log is a plain view toggle, not a machine state: useSessionMachine
// persists every non-setup state to paradone:activeSession, so a 'log' state
// would rehydrate the user into the log on reload.
const showLog = ref(false)
const loggedSessions = ref([])
function openLog() {
  loggedSessions.value = getSessions() // re-read on open so it's fresh after an audit
  showLog.value = true
}

const showArchive = ref(false)

const {
  state,
  remainingMs,
  totalMs,
  isPaused,
  showPrimerChoice,
  prefs,
  capture,
  primerIntent,
  auditProductive,
  auditNotes,
  taskListStartText,
  updatePrefs,
  startSession,
  openPrimerSetup,
  cancelPrimerSetup,
  startPrimer,
  skipPrimerCountdown,
  commitFullSession,
  stopPrimer,
  pauseSession,
  resumeSession,
  stopSession,
  takeBreak,
  keepGoing,
  submitAudit,
  skipAudit,
  startNewSession,
} = useSessionMachine()

// What got ticked off during this block: the list as it stands now, minus what
// was already checked when the block started.
const completedTasks = computed(() =>
  taskListStartText.value === null
    ? []
    : completedSince(taskListStartText.value, taskListText.value),
)

useDocumentTitle(state, remainingMs, isPaused)
</script>

<template>
  <div class="app">
    <section
      v-if="state === 'setup' && !showLog && !showArchive"
      class="card"
      aria-labelledby="task-list-heading"
    >
      <h2 id="task-list-heading" class="eyebrow">Task List</h2>
      <MarkdownChecklist
        :model-value="taskListText"
        @update:model-value="onTaskListUpdate"
        @archive="onArchiveCompleted"
      />
    </section>

    <section
      v-if="state === 'setup' && !showLog && !showArchive"
      class="card"
      aria-labelledby="start-heading"
    >
      <h2 id="start-heading" class="eyebrow">Start</h2>
      <SettingsPanel :prefs="prefs" @update="updatePrefs" />
      <button type="button" class="btn-primary setup__start" @click="startSession()">Start</button>
      <button type="button" class="btn-quiet" @click="openPrimerSetup()">
        Need help starting? Try a 2-minute primer
      </button>
      <div class="setup__links">
        <button type="button" class="btn-quiet" @click="openLog()">View log</button>
        <button type="button" class="btn-quiet" @click="showArchive = true">View archive</button>
      </div>
    </section>

    <section v-if="state === 'primerSetup'" class="card" aria-labelledby="primer-setup-heading">
      <h2 id="primer-setup-heading" class="eyebrow">Primer</h2>
      <label for="primer-intent" class="stage__question">What can you do in 2 minutes?</label>
      <textarea id="primer-intent" v-model="primerIntent" />
      <div class="actions">
        <button type="button" class="btn-quiet" @click="cancelPrimerSetup()">Back</button>
        <button
          type="button"
          class="btn-primary"
          :disabled="!primerIntent.trim()"
          @click="startPrimer()"
        >
          Start 2 minutes
        </button>
      </div>
    </section>

    <section v-if="state === 'primer'" class="card stage" aria-labelledby="primer-heading">
      <h2 id="primer-heading" class="eyebrow stage__heading">Primer</h2>
      <p class="stage__note">{{ primerIntent }}</p>
      <TimerDisplay
        :remaining-ms="remainingMs"
        :total-ms="totalMs"
        variant="primer"
        label="Primer"
      />
      <button v-if="!showPrimerChoice" type="button" class="btn-quiet" @click="skipPrimerCountdown()">
        Skip ahead
      </button>
      <template v-else>
        <p class="stage__question">Ready for a full session, or stop here?</p>
        <div class="actions actions--centred">
          <button type="button" class="btn-quiet" @click="stopPrimer()">Stop here</button>
          <button type="button" class="btn-primary" @click="commitFullSession()">
            Start full session
          </button>
        </div>
      </template>
    </section>

    <section v-if="state === 'active'" class="card stage" aria-labelledby="active-heading">
      <h2 id="active-heading" class="eyebrow stage__heading">Focus block</h2>
      <p v-if="primerIntent" class="stage__note">Primer: {{ primerIntent }}</p>
      <TimerDisplay
        :remaining-ms="remainingMs"
        :total-ms="totalMs"
        variant="session"
        :label="isPaused ? 'Paused' : 'Focus'"
      />
      <div class="transport">
        <button
          v-if="!isPaused"
          type="button"
          class="transport__button transport__button--primary"
          @click="pauseSession()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="5" width="3.5" height="14" rx="1.2" />
            <rect x="13.5" y="5" width="3.5" height="14" rx="1.2" />
          </svg>
          <span class="sr-only">Pause</span>
        </button>
        <button
          v-else
          type="button"
          class="transport__button transport__button--primary"
          @click="resumeSession()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" />
          </svg>
          <span class="sr-only">Resume</span>
        </button>
        <button type="button" class="transport__button" @click="stopSession()">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <span class="sr-only">Stop &amp; log session</span>
        </button>
      </div>
      <h3 id="active-task-list-heading" class="eyebrow">Task List</h3>
      <MarkdownChecklist
        :model-value="taskListText"
        :editable="false"
        @update:model-value="onTaskListUpdate"
      />
    </section>

    <section v-if="state === 'blockEnd'" class="card stage" aria-labelledby="block-end-heading">
      <h2 id="block-end-heading" class="eyebrow stage__heading">Block complete</h2>
      <p class="stage__question">Take the break, or keep going?</p>
      <div class="actions actions--centred">
        <button
          v-if="prefs.breakDuration > 0"
          type="button"
          class="btn-choice"
          @click="takeBreak()"
        >
          Take a break
        </button>
        <button type="button" class="btn-choice" @click="keepGoing()">Keep going</button>
      </div>
    </section>

    <section v-if="state === 'break'" class="card stage" aria-labelledby="break-heading">
      <h2 id="break-heading" class="eyebrow stage__heading">Break</h2>
      <TimerDisplay
        :remaining-ms="remainingMs"
        :total-ms="totalMs"
        variant="session"
        label="Break"
      />
    </section>

    <section
      v-if="state === 'primer' || state === 'active' || state === 'break'"
      class="card"
      aria-labelledby="capture-heading"
    >
      <h2 id="capture-heading" class="eyebrow">Capture</h2>
      <CaptureBox v-model="capture" />
    </section>

    <section v-if="state === 'audit'" class="card" aria-labelledby="audit-heading">
      <h2 id="audit-heading" class="eyebrow">Audit</h2>
      <AuditPrompt
        :task-list-text="taskListText"
        :completed-tasks="completedTasks"
        :capture="capture"
        @submit="submitAudit"
        @skip="skipAudit"
      />
    </section>

    <section v-if="state === 'summary'" class="card" aria-labelledby="summary-heading">
      <h2 id="summary-heading" class="eyebrow">Summary</h2>
      <SessionSummary
        :task-list-text="taskListText"
        :completed-tasks="completedTasks"
        :capture="capture"
        :audit-productive="auditProductive"
        :audit-notes="auditNotes"
        @start-new-session="startNewSession"
      />
    </section>

    <section v-if="showLog" class="card" aria-labelledby="log-heading">
      <h2 id="log-heading" class="eyebrow">Audit log</h2>
      <SessionLog :sessions="loggedSessions" @back="showLog = false" />
    </section>

    <section v-if="showArchive" class="card" aria-labelledby="archive-heading">
      <h2 id="archive-heading" class="eyebrow">Archived tasks</h2>
      <ArchiveView :entries="archive.archived" @back="showArchive = false" />
    </section>
  </div>
</template>

<style scoped>
/* A timer screen: everything centred under the ring. */
.stage {
  align-items: center;
  text-align: center;
  gap: var(--space-5);
}

/* Region labels inside a centred stage still read left-aligned. */
.stage .eyebrow:not(.stage__heading) {
  align-self: stretch;
  text-align: left;
}

.stage__note {
  color: var(--ink-secondary);
  max-width: 32ch;
}

.stage__question {
  font-size: var(--text-lg);
  color: var(--ink);
}

.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-3);
}

.actions--centred {
  justify-content: center;
}

/* Two equally valid answers to a question — neither one is the default. */
.btn-choice {
  padding: var(--space-3) var(--space-5);
  font-weight: 600;
}

.stage :deep(.markdown-checklist) {
  align-self: stretch;
  text-align: left;
}

.setup__start {
  font-size: var(--text-lg);
  align-self: stretch;
}

.setup__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
  border-top: 1px solid var(--hairline);
  padding-top: var(--space-3);
}

.setup__links button {
  flex: none;
  white-space: nowrap;
}

.transport {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.transport__button {
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  display: grid;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--control);
  border: none;
}

.transport__button:hover:not(:disabled) {
  background: var(--control);
  opacity: 0.75;
}

.transport__button svg {
  width: 1.75rem;
  height: 1.75rem;
  fill: var(--ink-secondary);
}

/* Icon-only, so this can use --accent rather than the darker --accent-strong:
   the visible content is a 2rem glyph (needs 3:1, has 4.0:1), not label text. */
.transport__button--primary {
  width: 4.5rem;
  height: 4.5rem;
  background: var(--accent);
}

.transport__button--primary:hover:not(:disabled) {
  background: var(--accent-strong);
  opacity: 1;
}

.transport__button--primary svg {
  width: 2rem;
  height: 2rem;
  fill: var(--ink-on-accent);
}
</style>
