<script setup>
// MarkdownChecklist: parse -> render -> toggle -> write-back.
// Bound to the single persistent Task List, reused across every state that shows it.
// Controlled component — the raw markdown string is owned by the parent,
// which is the only thing allowed to touch storage.js.
import { computed, ref } from 'vue'
import { parseChecklist, toggleItem, addItem, removeItem, editItem } from '../lib/checklist.js'
import TaskModal from './TaskModal.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  editable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'archive'])

// An empty string parses to a single blank line; render nothing for it so the
// list shows no phantom row (and no stray edit/delete controls) when empty.
const items = computed(() => (props.modelValue === '' ? [] : parseChecklist(props.modelValue)))

const checkedCount = computed(() => items.value.filter((item) => item.checked).length)

function onToggle(hash) {
  emit('update:modelValue', toggleItem(props.modelValue, hash))
}

// Ephemeral UI state for the add/edit modal. editingHash === null means "add".
const modalOpen = ref(false)
const editingHash = ref(null)
const modalDraft = ref('')

function openAdd() {
  editingHash.value = null
  modalDraft.value = ''
  modalOpen.value = true
}

function openEdit(item) {
  editingHash.value = item.hash
  modalDraft.value = item.text
  modalOpen.value = true
}

function onDelete(hash) {
  emit('update:modelValue', removeItem(props.modelValue, hash))
}

function onModalSubmit(text) {
  const next =
    editingHash.value === null
      ? addItem(props.modelValue, text)
      : editItem(props.modelValue, editingHash.value, text)
  emit('update:modelValue', next)
  modalOpen.value = false
}
</script>

<template>
  <ul class="markdown-checklist">
    <li v-for="item in items" :key="item.hash" class="markdown-checklist__item">
      <label v-if="item.checkbox">
        <input type="checkbox" :checked="item.checked" @change="onToggle(item.hash)" />
        <span>{{ item.text }}</span>
      </label>
      <span v-else>{{ item.text }}</span>
      <span v-if="editable" class="markdown-checklist__controls">
        <button type="button" class="btn-quiet" @click="openEdit(item)">Edit</button>
        <button type="button" class="btn-quiet" aria-label="Delete task" @click="onDelete(item.hash)">✕</button>
      </span>
    </li>
  </ul>
  <div v-if="editable" class="markdown-checklist__actions">
    <button type="button" class="markdown-checklist__add btn-quiet" @click="openAdd">+ Add Task</button>
    <button
      v-if="checkedCount"
      type="button"
      class="markdown-checklist__archive btn-quiet"
      @click="emit('archive')"
    >
      Archive completed ({{ checkedCount }})
    </button>
  </div>
  <TaskModal
    v-if="editable"
    :open="modalOpen"
    :initial-text="modalDraft"
    :title="editingHash === null ? 'Add Task' : 'Edit Task'"
    @submit="onModalSubmit"
    @close="modalOpen = false"
  />
</template>

<style scoped>
.markdown-checklist {
  list-style: none;
  margin: 0;
  padding: 0;
}

.markdown-checklist__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) 0;
}

/* Hairline between rows, not around them — the card already draws the edge. */
.markdown-checklist__item + .markdown-checklist__item {
  border-top: 1px solid var(--hairline);
}

.markdown-checklist__item label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  cursor: pointer;
}

.markdown-checklist__item input[type='checkbox'] {
  flex: none;
}

.markdown-checklist__controls {
  display: flex;
  gap: var(--space-1);
  margin-left: auto;
  /* Quiet until wanted, but never hidden from keyboard or touch. */
  opacity: 0;
  transition: opacity var(--duration);
}

.markdown-checklist__item:hover .markdown-checklist__controls,
.markdown-checklist__controls:focus-within {
  opacity: 1;
}

@media (hover: none) {
  .markdown-checklist__controls {
    opacity: 1;
  }
}

/* Wrap the row, not the labels inside each pill. */
.markdown-checklist__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.markdown-checklist__actions button {
  flex: none;
  white-space: nowrap;
}
</style>
