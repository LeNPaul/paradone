<script setup>
// SessionLog: read-only list of every logged post-session audit, newest first,
// with a markdown export of the whole log.
import { computed } from 'vue'
import { buildLogMarkdown, formatDateTime, formatTime, productiveLabel, sortNewestFirst } from '../lib/sessionLog.js'
import { downloadMarkdown } from '../lib/download.js'

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['back'])

const entries = computed(() => sortNewestFirst(props.sessions))

function onDownload() {
  downloadMarkdown(buildLogMarkdown(props.sessions), 'paradone-audit-log.md')
}
</script>

<template>
  <div class="session-log">
    <button type="button" @click="onDownload">Download log</button>
    <button type="button" @click="emit('back')">Back</button>

    <p v-if="!entries.length">No audits logged yet.</p>
    <ol v-else class="session-log__entries">
      <li v-for="entry in entries" :key="entry.id" class="session-log__entry">
        <h3>{{ formatDateTime(entry.auditedAt ?? entry.date) }}</h3>
        <p>Started: {{ formatTime(entry.date) }} · Audited: {{ formatTime(entry.auditedAt ?? entry.date) }}</p>
        <p>{{ entry.plannedDuration }} min planned / {{ entry.actualDuration }} min actual</p>
        <ul v-if="entry.completedTasks?.length">
          <li v-for="task in entry.completedTasks" :key="task">{{ task }}</li>
        </ul>
        <p v-if="entry.primerIntent">Primer: {{ entry.primerIntent }}</p>
        <p>{{ productiveLabel(entry.auditProductive) }}</p>
        <p v-if="entry.auditProductive && entry.auditNotes">{{ entry.auditNotes }}</p>
      </li>
    </ol>
  </div>
</template>
