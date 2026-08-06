<script setup>
// DataPanel: export everything to a JSON file, or restore one over the top.
// Parses and validates the picked file, then hands the parent a clean payload —
// storage writes stay in App.vue, same as the log and archive views.
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { parseBackup } from '../lib/backup.js'

const emit = defineEmits(['export', 'restore'])

const fileInput = ref(null)
const error = ref('')
const pending = ref(null)

async function onFileChange(event) {
  const input = event.target
  const file = input.files[0]
  // Clear the input so re-picking the same file still fires a change event.
  input.value = ''
  if (!file) return

  error.value = ''
  const result = parseBackup(await file.text())
  if (result.ok) {
    pending.value = result.data
  } else {
    error.value = result.error
  }
}

function onConfirmRestore() {
  const data = pending.value
  pending.value = null
  emit('restore', data)
}
</script>

<template>
  <div class="data-panel">
    <p class="data-panel__note">
      Everything stays on this device. Export a backup to move it, or keep it somewhere safe.
    </p>
    <div class="data-panel__actions">
      <button type="button" @click="emit('export')">Export data</button>
      <button type="button" @click="fileInput.click()">Import data</button>
    </div>
    <!-- The button is the accessible control; hidden keeps an unlabelled file
         input out of the tab order and off screen readers. -->
    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      hidden
      @change="onFileChange"
    />
    <p v-if="error" class="data-panel__error">{{ error }}</p>

    <ConfirmDialog
      :open="pending !== null"
      title="Replace all data?"
      message="This overwrites your Task List, audit log, archive and settings with the backup, and ends any session in progress. It cannot be undone."
      confirm-label="Replace"
      @confirm="onConfirmRestore"
      @close="pending = null"
    />
  </div>
</template>

<style scoped>
.data-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.data-panel__note {
  font-size: var(--text-sm);
  color: var(--ink-muted);
}

.data-panel__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.data-panel__error {
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}
</style>
