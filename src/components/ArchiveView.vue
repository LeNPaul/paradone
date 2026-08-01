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
    <button type="button" @click="onDownload">Download archive</button>
    <button type="button" @click="emit('back')">Back</button>

    <p v-if="!sorted.length">No tasks archived yet.</p>
    <ol v-else class="archive-view__entries">
      <li v-for="entry in sorted" :key="entry.id" class="archive-view__entry">
        <span>{{ entry.text }}</span>
        <time :datetime="entry.completedAt">{{ formatDateTime(entry.completedAt) }}</time>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.archive-view__entries {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.archive-view__entry {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
}
</style>
