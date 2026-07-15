<script setup>
import { ref } from 'vue'
import MarkdownChecklist from './components/MarkdownChecklist.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import CaptureBox from './components/CaptureBox.vue'
import AuditPrompt from './components/AuditPrompt.vue'
import SessionSummary from './components/SessionSummary.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { getGoalsList, setGoalsList } from './lib/storage.js'
import { useSessionMachine } from './composables/useSessionMachine.js'

const goalsListText = ref(getGoalsList().text)
function onGoalsListUpdate(text) {
  goalsListText.value = text
  setGoalsList({ text, updatedAt: new Date().toISOString() })
}

const {
  state,
  sessionGoalText,
  remainingMs,
  showPrimerChoice,
  prefs,
  captures,
  auditProductive,
  auditNotes,
  updatePrefs,
  startSession,
  startPrimer,
  skipPrimerCountdown,
  commitFullSession,
  stopPrimer,
  takeBreak,
  keepGoing,
  addCapture,
  submitAudit,
  startNewSession,
} = useSessionMachine()
</script>

<template>
  <div class="app">
    <section v-if="state === 'setup'" aria-labelledby="goals-list-heading">
      <h2 id="goals-list-heading">Goals List</h2>
      <MarkdownChecklist :model-value="goalsListText" @update:model-value="onGoalsListUpdate" />
    </section>

    <section v-if="state === 'setup'" aria-labelledby="session-goal-heading">
      <h2 id="session-goal-heading">Session Goal</h2>
      <MarkdownChecklist v-model="sessionGoalText" />
    </section>

    <section v-if="state === 'setup'" aria-labelledby="start-heading">
      <h2 id="start-heading">Start</h2>
      <SettingsPanel :prefs="prefs" @update="updatePrefs" />
      <button type="button" @click="startPrimer()">Need help starting? Try a 2-minute primer</button>
      <button type="button" @click="startSession()">Start</button>
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
      <h3 id="active-session-goal-heading">Session Goal</h3>
      <MarkdownChecklist v-model="sessionGoalText" />
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
      <CaptureBox :captures="captures" @add="addCapture" />
    </section>

    <section v-if="state === 'audit'" aria-labelledby="audit-heading">
      <h2 id="audit-heading">Audit</h2>
      <AuditPrompt :session-goal-text="sessionGoalText" @submit="submitAudit" />
    </section>

    <section v-if="state === 'summary'" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Summary</h2>
      <SessionSummary
        :session-goal-text="sessionGoalText"
        :captures="captures"
        :audit-productive="auditProductive"
        :audit-notes="auditNotes"
        @start-new-session="startNewSession"
      />
    </section>
  </div>
</template>
