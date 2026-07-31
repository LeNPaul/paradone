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
  <dialog ref="dialog" class="task-modal" @close="emit('close')">
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
        <button type="button" @click="emit('close')">Cancel</button>
        <button type="submit" :disabled="draft.trim() === ''">Save</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.task-modal {
  border: none;
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: min(20rem, 90vw);
}

.task-modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
}

.task-modal__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-modal__title {
  margin: 0;
}

.task-modal__input {
  box-sizing: border-box;
  width: 100%;
  font: inherit;
  padding: 0.375rem 0.5rem;
}

.task-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
