<script setup>
// ConfirmDialog: a native <dialog> gating a destructive action.
// The parent owns the `open` flag and does the work on `confirm`.
import { ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Are you sure?',
  },
  message: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'Clear',
  },
})

const emit = defineEmits(['confirm', 'close'])

const dialog = ref(null)

// Drive the native dialog from the `open` prop.
watch(
  () => props.open,
  (open) => {
    if (open) {
      dialog.value?.showModal()
    } else {
      dialog.value?.close()
    }
  }
)
</script>

<template>
  <dialog ref="dialog" class="confirm-dialog" @close="emit('close')">
    <div class="confirm-dialog__body">
      <h3 class="confirm-dialog__title">{{ title }}</h3>
      <p v-if="message" class="confirm-dialog__message">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button type="button" class="btn-quiet" @click="emit('close')">Cancel</button>
        <button type="button" class="btn-primary" @click="emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.confirm-dialog {
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  min-width: min(24rem, 90vw);
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-modal);
}

.confirm-dialog::backdrop {
  background: var(--scrim);
}

.confirm-dialog__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.confirm-dialog__title {
  margin: 0;
}

.confirm-dialog__message {
  color: var(--ink-muted);
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-2);
}
</style>
