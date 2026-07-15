<script setup>
import { ref } from 'vue'
import MarkdownChecklist from './components/MarkdownChecklist.vue'
import { getGoalsList, setGoalsList } from './lib/storage.js'

// Drives the single-page state machine from spec.md §3:
// setup | primer | active | blockEnd | break | audit | summary
const state = ref('setup')

const goalsListText = ref(getGoalsList().text)
function onGoalsListUpdate(text) {
  goalsListText.value = text
  setGoalsList({ text, updatedAt: new Date().toISOString() })
}

// Session Goal is blank at the start of every session — plain local
// state, deliberately never written to storage.
const sessionGoalText = ref('')
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
  </div>
</template>
