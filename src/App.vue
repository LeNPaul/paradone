<script setup>
import { ref, computed, watch } from 'vue'
import MarkdownChecklist from './components/MarkdownChecklist.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import CaptureBox from './components/CaptureBox.vue'
import AuditPrompt from './components/AuditPrompt.vue'
import SessionSummary from './components/SessionSummary.vue'
import SessionLog from './components/SessionLog.vue'
import ArchiveView from './components/ArchiveView.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import DataPanel from './components/DataPanel.vue'
import { getGoalsList, setGoalsList, getSessions, setSessions, getArchive, setArchive } from './lib/storage.js'
import { completedSince, parseChecklist } from './lib/checklist.js'
import { createTimer } from './lib/timer.js'
import { syncCompletions, archiveChecked } from './lib/archive.js'
import { buildBackup, backupFilename, restoreBackup } from './lib/backup.js'
import { downloadJSON } from './lib/download.js'
import { useSessionMachine } from './composables/useSessionMachine.js'
import { useDocumentTitle } from './composables/useDocumentTitle.js'
import { useTheme } from './composables/useTheme.js'

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

// Only the swept tasks go: completedAt holds tick times for tasks still on the
// live list, so clearing it would lose when they were checked.
function onClearArchive() {
  archive.value = { ...archive.value, archived: [] }
  setArchive(archive.value)
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
function onClearLog() {
  setSessions([])
  loggedSessions.value = []
}

const showArchive = ref(false)

// Settings is a view toggle for the same reason the log and archive are: a
// machine state would be persisted to paradone:activeSession and rehydrate the
// user into settings on reload.
const showSettings = ref(false)

function onExportData() {
  const now = new Date().toISOString()
  downloadJSON(JSON.stringify(buildBackup(now), null, 2), backupFilename(now))
}

// Every ref here was hydrated from storage once at setup, and its watcher would
// write the stale value straight back over the import — so a reload is the
// re-hydration.
function onRestoreData(data) {
  restoreBackup(data)
  window.location.reload()
}

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
  endBreak,
  keepGoing,
  endSession,
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

// Tasks already ticked before this block began are finished work — hide them
// from the running list. Ones ticked during the block stay, so in-block
// progress is visible and a mis-click can be undone.
const hiddenTaskHashes = computed(() =>
  taskListStartText.value === null
    ? []
    : parseChecklist(taskListStartText.value)
        .filter((item) => item.checked)
        .map((item) => item.hash),
)

// The setup ring previews the configured block, so it uses the same
// minutes → ms conversion a real session's timer does.
const idleTotalMs = computed(() => createTimer(prefs.workDuration).durationMs)

// Settings can be open over a running block, so get out of the way when the
// machine advances — otherwise it would swallow the block-end prompt.
watch(state, () => {
  showSettings.value = false
})

useDocumentTitle(state, remainingMs, isPaused)
useTheme(prefs, updatePrefs)
</script>

<template>
  <div class="app">
    <!-- The one element outside the state machine: every state renders below it,
         so settings (and the theme inside them) stay reachable mid-session. -->
    <header class="app__header">
      <span class="app__wordmark">Paradone</span>
      <button type="button" class="app__settings" @click="showSettings = !showSettings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.25" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
          />
        </svg>
        <span class="sr-only">Settings</span>
      </button>
    </header>

    <section v-if="showSettings" class="card" aria-labelledby="settings-heading">
      <h2 id="settings-heading" class="eyebrow">Settings</h2>
      <button type="button" class="btn-quiet settings__back" @click="showSettings = false">
        Back
      </button>
      <SettingsPanel :prefs="prefs" @update="updatePrefs" />
      <div class="settings__appearance">
        <span class="settings__label">Appearance</span>
        <ThemeToggle :theme="prefs.theme" @update="(theme) => updatePrefs({ theme })" />
      </div>
      <section class="settings__data" aria-labelledby="data-heading">
        <h3 id="data-heading" class="eyebrow">Data</h3>
        <DataPanel @export="onExportData" @restore="onRestoreData" />
      </section>
    </section>

    <template v-else>
      <section
        v-if="state === 'setup' && !showLog && !showArchive"
        class="card stage"
        aria-labelledby="start-heading"
      >
        <h2 id="start-heading" class="eyebrow stage__heading">Start</h2>
        <TimerDisplay
          :remaining-ms="idleTotalMs"
          :total-ms="idleTotalMs"
          variant="session"
          label="Ready"
        />
        <div class="transport">
          <button
            type="button"
            class="transport__button transport__button--primary"
            @click="startSession()"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z"
              />
            </svg>
            <span class="sr-only">Start</span>
          </button>
        </div>
        <button type="button" class="btn-quiet" @click="openPrimerSetup()">
          Need help starting? Try a 2-minute primer
        </button>
        <div class="setup__links">
          <button type="button" class="btn-quiet" @click="openLog()">View log</button>
          <button type="button" class="btn-quiet" @click="showArchive = true">View archive</button>
        </div>
      </section>

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
        <button
          v-if="!showPrimerChoice"
          type="button"
          class="btn-quiet"
          @click="skipPrimerCountdown()"
        >
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
              <path
                d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z"
              />
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
          :hidden-hashes="hiddenTaskHashes"
          @update:model-value="onTaskListUpdate"
        />
      </section>

      <section v-if="state === 'blockEnd'" class="card stage" aria-labelledby="block-end-heading">
        <h2 id="block-end-heading" class="eyebrow stage__heading">Block complete</h2>
        <p class="stage__question">Take the break, keep going, or wrap up?</p>
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
          <button type="button" class="btn-choice" @click="endSession()">End session</button>
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
        <div class="transport">
          <button type="button" class="transport__button" @click="endBreak()">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span class="sr-only">End break</span>
          </button>
        </div>
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
          :completed-tasks="completedTasks"
          :capture="capture"
          :audit-productive="auditProductive"
          :audit-notes="auditNotes"
          @start-new-session="startNewSession"
        />
      </section>

      <section v-if="showLog" class="card" aria-labelledby="log-heading">
        <h2 id="log-heading" class="eyebrow">Audit log</h2>
        <SessionLog :sessions="loggedSessions" @back="showLog = false" @clear="onClearLog" />
      </section>

      <section v-if="showArchive" class="card" aria-labelledby="archive-heading">
        <h2 id="archive-heading" class="eyebrow">Archived tasks</h2>
        <ArchiveView
          :entries="archive.archived"
          @back="showArchive = false"
          @clear="onClearArchive"
        />
      </section>
    </template>
  </div>
</template>

<style scoped>
.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app__wordmark {
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink-secondary);
}

.app__settings {
  display: grid;
  place-items: center;
  padding: var(--space-2);
  background: var(--control);
  border-color: transparent;
  border-radius: var(--radius-full);
  color: var(--ink-secondary);
}

.app__settings:hover:not(:disabled) {
  background: var(--control);
  color: var(--ink);
}

.app__settings svg {
  width: 1.125rem;
  height: 1.125rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Back sits above the fields, so it reads as leaving rather than confirming. */
.settings__back {
  align-self: flex-start;
}

/* Matches a SettingsPanel field so the theme control reads as a third setting. */
.settings__appearance {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.settings__label {
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}

/* The last block in settings, and the only destructive one — a rule sets it
   apart from the fields above. */
.settings__data {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-top: 1px solid var(--hairline);
  padding-top: var(--space-4);
}

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
  flex-wrap: wrap;
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

/* The solid ink circle from the monochrome reference — the app's one heaviest
   element, carrying a 2rem glyph rather than label text. */
.transport__button--primary {
  width: 4.5rem;
  height: 4.5rem;
  background: var(--accent);
}

/* Dims rather than darkens: --accent and --accent-strong are the same ink under
   monochrome, so a background swap would be a no-op. */
.transport__button--primary:hover:not(:disabled) {
  background: var(--accent);
  opacity: 0.85;
}

.transport__button--primary svg {
  width: 2rem;
  height: 2rem;
  fill: var(--ink-on-accent);
}
</style>
