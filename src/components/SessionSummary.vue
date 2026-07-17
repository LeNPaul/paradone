<script setup>
// SessionSummary: assembles markdown (task list, captures, audit), copy + download
import { computed } from 'vue'

const props = defineProps({
  taskListText: {
    type: String,
    default: '',
  },
  captures: {
    type: Array,
    default: () => [],
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

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const PRODUCTIVE_LABELS = { focused: 'Focused', distracted: 'Distracted', mixed: 'Mixed' }

const markdown = computed(() => {
  const captureLines = props.captures.length
    ? props.captures.map((c) => `- **${formatTime(c.timestamp)}** — ${c.text}`).join('\n')
    : '_No captures recorded._'

  const productiveLabel = PRODUCTIVE_LABELS[props.auditProductive] ?? props.auditProductive

  return `# Session Summary

## Tasks
${props.taskListText}

## Captures
${captureLines}

## Audit
- **Focus:** ${productiveLabel}
- **What actually got done:** ${props.auditNotes || '_(none noted)_'}
`
})

async function onCopy() {
  await navigator.clipboard.writeText(markdown.value)
}

function onDownload() {
  const blob = new Blob([markdown.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'paradone-session.md'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="session-summary">
    <pre class="session-summary__markdown">{{ markdown }}</pre>
    <button type="button" @click="onCopy">Copy</button>
    <button type="button" @click="onDownload">Download</button>
    <button type="button" @click="emit('start-new-session')">Start new session</button>
  </div>
</template>
