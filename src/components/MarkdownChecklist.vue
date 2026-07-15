<script setup>
// MarkdownChecklist: parse -> render -> toggle -> write-back.
// Used twice: bound to the Goals List and to the per-session Session Goal.
// Controlled component — the raw markdown string is owned by the parent,
// which is the only thing allowed to touch storage.js.
import { computed } from 'vue'
import { parseChecklist, toggleItem } from '../lib/checklist.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const items = computed(() => parseChecklist(props.modelValue))

// checklist.js already confirmed the marker is present before item.checkbox
// is true, so this is a safe strip, not a re-detection of checkbox lines.
function displayText(item) {
  return item.checkbox ? item.line.replace(/^- \[[ xX]\] ?/, '') : item.line
}

function onToggle(hash) {
  emit('update:modelValue', toggleItem(props.modelValue, hash))
}
</script>

<template>
  <ul class="markdown-checklist">
    <li v-for="item in items" :key="item.hash" class="markdown-checklist__item">
      <label v-if="item.checkbox">
        <input type="checkbox" :checked="item.checked" @change="onToggle(item.hash)" />
        <span>{{ displayText(item) }}</span>
      </label>
      <span v-else>{{ displayText(item) }}</span>
    </li>
  </ul>
</template>

<style scoped>
.markdown-checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--markdown-checklist-gap, 0.25rem);
}

.markdown-checklist__item label {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
}

.markdown-checklist__item input[type='checkbox'] {
  accent-color: var(--markdown-checklist-accent, currentColor);
}
</style>
