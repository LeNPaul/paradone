<script setup>
// SessionLog: read-only list of every logged post-session audit, newest first,
// with a markdown export of the whole log.
import { computed, ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { buildLogMarkdown, formatDateTime, formatTime, productiveLabel, sortNewestFirst } from '../lib/sessionLog.js'
import { downloadMarkdown } from '../lib/download.js'

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['back', 'clear'])

const entries = computed(() => sortNewestFirst(props.sessions))

const confirming = ref(false)

const confirmMessage = computed(() => {
  const count = entries.value.length
  return `This permanently deletes ${count} logged audit${count === 1 ? '' : 's'}. It cannot be undone.`
})

function onDownload() {
  downloadMarkdown(buildLogMarkdown(props.sessions), 'paradone-audit-log.md')
}

function onConfirmClear() {
  confirming.value = false
  emit('clear')
}
</script>

<template>
  <div class="session-log">
    <div class="session-log__bar">
      <button type="button" class="btn-quiet" @click="emit('back')">Back</button>
      <div class="session-log__actions">
        <button v-if="entries.length" type="button" class="btn-quiet" @click="confirming = true">
          Clear log
        </button>
        <button type="button" @click="onDownload">Download log</button>
      </div>
    </div>

    <ConfirmDialog
      :open="confirming"
      title="Clear log?"
      :message="confirmMessage"
      @confirm="onConfirmClear"
      @close="confirming = false"
    />

    <p v-if="!entries.length" class="session-log__empty">No audits logged yet.</p>
    <ol v-else class="list-reset session-log__entries">
      <li v-for="entry in entries" :key="entry.id" class="session-log__entry">
        <h3 class="session-log__date">{{ formatDateTime(entry.auditedAt ?? entry.date) }}</h3>
        <p class="session-log__meta">Started: {{ formatTime(entry.date) }} · Audited: {{ formatTime(entry.auditedAt ?? entry.date) }}</p>
        <p class="session-log__meta">{{ entry.plannedDuration }} min planned / {{ entry.actualDuration }} min actual</p>
        <ul v-if="entry.completedTasks?.length" class="list-reset session-log__tasks">
          <li v-for="task in entry.completedTasks" :key="task">{{ task }}</li>
        </ul>
        <p v-if="entry.primerIntent" class="session-log__meta">Primer: {{ entry.primerIntent }}</p>
        <p class="session-log__rating">{{ productiveLabel(entry.auditProductive) }}</p>
        <p v-if="entry.auditProductive && entry.auditNotes">{{ entry.auditNotes }}</p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.session-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.session-log__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-log__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.session-log__empty {
  color: var(--ink-muted);
}

.session-log__entries {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.session-log__entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  background: var(--surface-sunken);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.session-log__date {
  font-size: var(--text-base);
  font-weight: 600;
}

.session-log__meta {
  font-size: var(--text-sm);
  color: var(--ink-muted);
}

.session-log__tasks {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.session-log__tasks li::before {
  content: '✓';
  color: var(--accent);
  margin-right: var(--space-2);
}

.session-log__rating {
  margin-top: var(--space-2);
  font-weight: 600;
}
</style>
