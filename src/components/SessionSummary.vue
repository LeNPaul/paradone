<script setup>
// SessionSummary: assembles markdown (task list, captures, audit), copy + download
import { computed } from 'vue'
import { PRODUCTIVE_LABELS } from '../lib/sessionLog.js'
import { downloadMarkdown } from '../lib/download.js'

const props = defineProps({
  taskListText: {
    type: String,
    default: '',
  },
  completedTasks: {
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

const markdown = computed(() => {
  const captureText = props.capture.trim() || '_No captures recorded._'

  const completedText = props.completedTasks.length
    ? props.completedTasks.map((task) => `- ${task}`).join('\n')
    : '_No tasks checked off this session._'

  // A skipped audit leaves auditProductive empty; a submitted one always has a
  // Focus value (the audit prompt requires one), so empty here means skipped —
  // in which case the whole Audit section is omitted.
  const productiveLabel = PRODUCTIVE_LABELS[props.auditProductive] ?? props.auditProductive
  const auditSection = props.auditProductive
    ? `

## Audit
- **Focus:** ${productiveLabel}
- **What actually got done:** ${props.auditNotes || '_(none noted)_'}`
    : ''

  return `# Session Summary

## Tasks
${props.taskListText}

## Completed this session
${completedText}

## Captures
${captureText}${auditSection}
`
})

async function onCopy() {
  await navigator.clipboard.writeText(markdown.value)
}

function onDownload() {
  downloadMarkdown(markdown.value, 'paradone-session.md')
}
</script>

<template>
  <div class="session-summary">
    <pre class="session-summary__markdown">{{ markdown }}</pre>
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
  gap: var(--space-4);
}

/* The export, shown as the quiet source text it is. */
.session-summary__markdown {
  background: var(--surface-sunken);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  color: var(--ink-secondary);
  max-height: 24rem;
  overflow-y: auto;
}

.session-summary__actions {
  display: flex;
  gap: var(--space-2);
}
</style>
