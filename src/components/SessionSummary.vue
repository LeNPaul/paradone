<script setup>
// SessionSummary: renders the end-of-session record, copy + download as markdown
import { computed } from 'vue'
import { PRODUCTIVE_LABELS } from '../lib/sessionLog.js'
import { buildSummaryMarkdown } from '../lib/summary.js'
import { downloadMarkdown } from '../lib/download.js'

const props = defineProps({
  completedTasks: {
    type: Array,
    default: () => [],
  },
  // Tasks that weren't on the list when the block started. A superset of what's
  // completed — it includes ones still unticked — so it's intersected here.
  addedTasks: {
    type: Array,
    default: () => [],
  },
  capture: {
    type: String,
    default: '',
  },
  auditProductive: {
    type: String,
    default: '',
  },
  auditNotes: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['start-new-session'])

const markdown = computed(() => buildSummaryMarkdown(props))

const addedSet = computed(() => new Set(props.addedTasks))

const productiveLabel = computed(
  () => PRODUCTIVE_LABELS[props.auditProductive] ?? props.auditProductive,
)

async function onCopy() {
  await navigator.clipboard.writeText(markdown.value)
}

function onDownload() {
  downloadMarkdown(markdown.value, 'paradone-session.md')
}
</script>

<template>
  <div class="session-summary">
    <section
      v-if="completedTasks.length"
      class="session-summary__block"
      aria-labelledby="summary-completed-heading"
    >
      <h3 id="summary-completed-heading" class="eyebrow">Completed this session</h3>
      <ul class="list-reset session-summary__completed">
        <li v-for="task in completedTasks" :key="task">
          {{ task }}<span v-if="addedSet.has(task)" class="task-badge">added</span>
        </li>
      </ul>
    </section>

    <section
      v-if="capture.trim()"
      class="session-summary__block"
      aria-labelledby="summary-captures-heading"
    >
      <h3 id="summary-captures-heading" class="eyebrow">Captures</h3>
      <pre class="session-summary__capture">{{ capture.trim() }}</pre>
    </section>

    <section
      v-if="auditProductive"
      class="session-summary__block"
      aria-labelledby="summary-audit-heading"
    >
      <h3 id="summary-audit-heading" class="eyebrow">Audit</h3>
      <p><strong>Focus:</strong> {{ productiveLabel }}</p>
      <p v-if="auditNotes"><strong>What actually got done:</strong> {{ auditNotes }}</p>
      <p v-else>
        <strong>What actually got done:</strong>
        <span class="session-summary__empty">(none noted)</span>
      </p>
    </section>

    <div class="session-summary__actions">
      <button type="button" @click="onCopy">Copy</button>
      <button type="button" @click="onDownload">Download</button>
    </div>
    <button type="button" class="btn-primary" @click="emit('start-new-session')">
      Start new session
    </button>
  </div>
</template>

<style scoped>
.session-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.session-summary__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.session-summary__completed {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.session-summary__completed li::before {
  content: '✓';
  color: var(--accent);
  margin-right: var(--space-2);
}

.session-summary__empty {
  color: var(--ink-muted);
}

.session-summary__capture {
  background: var(--surface-sunken);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  color: var(--ink-secondary);
}

.session-summary__actions {
  display: flex;
  gap: var(--space-2);
}
</style>
