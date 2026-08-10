<script setup>
// TaskModal: a native <dialog> for adding or editing a single task.
// Emits the trimmed text on save; the parent owns the task list string.
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  initialText: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Add Task',
  },
})

const emit = defineEmits(['submit', 'close'])

const dialog = ref(null)
const input = ref(null)
const draft = ref('')

// Drive the native dialog from the `open` prop; reseed and focus on each open.
watch(
  () => props.open,
  (open) => {
    if (open) {
      draft.value = props.initialText
      dialog.value?.showModal()
      nextTick(() => input.value?.focus())
    } else {
      dialog.value?.close()
    }
  }
)

function onSubmit() {
  if (draft.value.trim() === '') return
  emit('submit', draft.value.trim())
}
</script>

<template>
  <!-- Escape fires `cancel`, and Chrome does not reliably follow it with
       `close` — without this the parent's `open` stays true while the dialog is
       shut, and nothing can reopen it. -->
  <dialog ref="dialog" class="task-modal" @cancel="emit('close')" @close="emit('close')">
    <form class="task-modal__form" @submit.prevent="onSubmit">
      <h3 class="task-modal__title">{{ title }}</h3>
      <input
        ref="input"
        v-model="draft"
        class="task-modal__input"
        type="text"
        aria-label="Task"
        placeholder="What needs doing?"
      />
      <div class="task-modal__actions">
        <button type="button" class="btn-quiet" @click="emit('close')">Cancel</button>
        <button type="submit" class="btn-primary" :disabled="draft.trim() === ''">Save</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.task-modal {
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  min-width: min(24rem, 90vw);
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-modal);
}

.task-modal::backdrop {
  background: var(--scrim);
}

.task-modal__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-modal__title {
  margin: 0;
}

.task-modal__input {
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-lg);
}

.task-modal__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-2);
}
</style>
