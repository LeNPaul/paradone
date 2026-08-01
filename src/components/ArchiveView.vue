<script setup>
// ArchiveView: read-only list of tasks swept off the Task List, newest first,
// each showing when it was ticked off, with a markdown export of the whole
// archive.
import { computed } from 'vue'
import { buildArchiveMarkdown, sortNewestFirst } from '../lib/archive.js'
import { formatDateTime } from '../lib/sessionLog.js'
import { downloadMarkdown } from '../lib/download.js'

const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['back'])

const sorted = computed(() => sortNewestFirst(props.entries))

function onDownload() {
  downloadMarkdown(buildArchiveMarkdown(props.entries), 'paradone-archived-tasks.md')
}
</script>

<template>
  <div class="archive-view">
    <div class="archive-view__bar">
      <button type="button" class="btn-quiet" @click="emit('back')">Back</button>
      <button type="button" @click="onDownload">Download archive</button>
    </div>

    <p v-if="!sorted.length" class="archive-view__empty">No tasks archived yet.</p>
    <ol v-else class="list-reset archive-view__entries">
      <li v-for="entry in sorted" :key="entry.id" class="archive-view__entry">
        <span>{{ entry.text }}</span>
        <time :datetime="entry.completedAt">{{ formatDateTime(entry.completedAt) }}</time>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.archive-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.archive-view__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.archive-view__empty {
  color: var(--ink-muted);
}

.archive-view__entries {
  display: flex;
  flex-direction: column;
}

.archive-view__entry {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}

.archive-view__entry + .archive-view__entry {
  border-top: 1px solid var(--hairline);
}

.archive-view__entry time {
  flex: none;
  font-size: var(--text-sm);
  color: var(--ink-muted);
}
</style>
