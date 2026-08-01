<script setup>
import { ref } from 'vue'
import MarkdownChecklist from './components/MarkdownChecklist.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import CaptureBox from './components/CaptureBox.vue'
import AuditPrompt from './components/AuditPrompt.vue'
import SessionSummary from './components/SessionSummary.vue'
import SessionLog from './components/SessionLog.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { getGoalsList, setGoalsList, getSessions } from './lib/storage.js'
import { useSessionMachine } from './composables/useSessionMachine.js'
import { useDocumentTitle } from './composables/useDocumentTitle.js'

const taskListText = ref(getGoalsList().text)
function onTaskListUpdate(text) {
  taskListText.value = text
  setGoalsList({ text, updatedAt: new Date().toISOString() })
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

const {
  state,
  remainingMs,
  isPaused,
  showPrimerChoice,
  prefs,
  capture,
  auditProductive,
  auditNotes,
  updatePrefs,
  startSession,
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

useDocumentTitle(state, remainingMs, isPaused)
</script>

<template>
  <div class="app">
    <section v-if="state === 'setup' && !showLog" aria-labelledby="task-list-heading">
      <h2 id="task-list-heading">Task List</h2>
      <MarkdownChecklist :model-value="taskListText" @update:model-value="onTaskListUpdate" />
    </section>

    <section v-if="state === 'setup' && !showLog" aria-labelledby="start-heading">
      <h2 id="start-heading">Start</h2>
      <SettingsPanel :prefs="prefs" @update="updatePrefs" />
      <button type="button" @click="startPrimer()">Need help starting? Try a 2-minute primer</button>
      <button type="button" @click="startSession()">Start</button>
      <button type="button" @click="openLog()">View log</button>
    </section>

    <section v-if="state === 'primer'" aria-labelledby="primer-heading">
      <h2 id="primer-heading">Primer</h2>
      <TimerDisplay :remaining-ms="remainingMs" variant="primer" />
      <button v-if="!showPrimerChoice" type="button" @click="skipPrimerCountdown()">Skip ahead</button>
      <div v-else>
        <p>Ready for a full session, or stop here?</p>
        <button type="button" @click="commitFullSession()">Start full session</button>
        <button type="button" @click="stopPrimer()">Stop here</button>
      </div>
    </section>

    <section v-if="state === 'active'" aria-labelledby="active-heading">
      <h2 id="active-heading">Focus block</h2>
      <TimerDisplay :remaining-ms="remainingMs" variant="session" />
      <button v-if="!isPaused" type="button" @click="pauseSession()">Pause</button>
      <button v-else type="button" @click="resumeSession()">Resume</button>
      <button type="button" @click="stopSession()">Stop &amp; log session</button>
      <h3 id="active-task-list-heading">Task List</h3>
      <MarkdownChecklist
        :model-value="taskListText"
        :editable="false"
        @update:model-value="onTaskListUpdate"
      />
    </section>

    <section v-if="state === 'blockEnd'" aria-labelledby="block-end-heading">
      <h2 id="block-end-heading">Block complete</h2>
      <p>Take the break, or keep going?</p>
      <button v-if="prefs.breakDuration > 0" type="button" @click="takeBreak()">Take a break</button>
      <button type="button" @click="keepGoing()">Keep going</button>
    </section>

    <section v-if="state === 'break'" aria-labelledby="break-heading">
      <h2 id="break-heading">Break</h2>
      <TimerDisplay :remaining-ms="remainingMs" variant="session" />
    </section>

    <section
      v-if="state === 'primer' || state === 'active' || state === 'break'"
      aria-labelledby="capture-heading"
    >
      <h2 id="capture-heading">Capture</h2>
      <CaptureBox v-model="capture" />
    </section>

    <section v-if="state === 'audit'" aria-labelledby="audit-heading">
      <h2 id="audit-heading">Audit</h2>
      <AuditPrompt
        :task-list-text="taskListText"
        :capture="capture"
        @submit="submitAudit"
        @skip="skipAudit"
      />
    </section>

    <section v-if="state === 'summary'" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Summary</h2>
      <SessionSummary
        :task-list-text="taskListText"
        :capture="capture"
        :audit-productive="auditProductive"
        :audit-notes="auditNotes"
        @start-new-session="startNewSession"
      />
    </section>

    <section v-if="showLog" aria-labelledby="log-heading">
      <h2 id="log-heading">Audit log</h2>
      <SessionLog :sessions="loggedSessions" @back="showLog = false" />
    </section>
  </div>
</template>
