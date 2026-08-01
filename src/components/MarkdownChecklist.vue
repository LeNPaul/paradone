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

const emit = defineEmits(['update:modelValue'])

// An empty string parses to a single blank line; render nothing for it so the
// list shows no phantom row (and no stray edit/delete controls) when empty.
const items = computed(() => (props.modelValue === '' ? [] : parseChecklist(props.modelValue)))

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
        <button type="button" @click="openEdit(item)">Edit</button>
        <button type="button" aria-label="Delete task" @click="onDelete(item.hash)">✕</button>
      </span>
    </li>
  </ul>
  <button v-if="editable" type="button" class="markdown-checklist__add" @click="openAdd">
    + Add Task
  </button>
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
  display: flex;
  flex-direction: column;
  gap: var(--markdown-checklist-gap, 0.25rem);
}

.markdown-checklist__item {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
}

.markdown-checklist__item label {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
}

.markdown-checklist__controls {
  display: flex;
  gap: 0.25rem;
}

.markdown-checklist__add {
  margin-top: 0.5rem;
}

.markdown-checklist__item input[type='checkbox'] {
  accent-color: var(--markdown-checklist-accent, currentColor);
}
</style>
