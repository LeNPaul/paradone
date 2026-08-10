<script setup>
// SettingsPanel: work/break durations and the add-task shortcut key, stored
// separately from session data
import { ref, watch } from 'vue'

const props = defineProps({
  prefs: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update'])

const workDuration = ref(props.prefs.workDuration)
const breakDuration = ref(props.prefs.breakDuration)
const addTaskKey = ref(props.prefs.addTaskKey)

watch(
  () => props.prefs,
  (prefs) => {
    workDuration.value = prefs.workDuration
    breakDuration.value = prefs.breakDuration
    addTaskKey.value = prefs.addTaskKey
  },
)

function clamp(value, min, previous) {
  if (value === '' || value === null) return previous
  const rounded = Math.round(Number(value))
  return Number.isFinite(rounded) ? Math.max(min, rounded) : previous
}

function onWorkChange() {
  const value = clamp(workDuration.value, 1, props.prefs.workDuration)
  workDuration.value = value
  emit('update', { workDuration: value, breakDuration: breakDuration.value })
}

function onBreakChange() {
  const value = clamp(breakDuration.value, 0, props.prefs.breakDuration)
  breakDuration.value = value
  emit('update', { workDuration: workDuration.value, breakDuration: value })
}

// Blank is meaningful — it turns the shortcut off — so it's kept rather than
// treated as a non-answer the way an empty duration is.
function normalizeKey(value, previous) {
  const key = String(value ?? '').trim().toLowerCase()
  if (key === '') return ''
  return /^[a-z]$/.test(key) ? key : previous
}

// Emits only its own key, so changing the shortcut doesn't also re-send the
// durations. updatePrefs merges, so a partial payload is enough.
function onKeyChange() {
  const value = normalizeKey(addTaskKey.value, props.prefs.addTaskKey)
  addTaskKey.value = value
  emit('update', { addTaskKey: value })
}
</script>

<template>
  <div class="settings-panel">
    <div class="settings-panel__field">
      <label for="work-duration">Work (minutes)</label>
      <input id="work-duration" v-model.number="workDuration" type="number" min="1" @change="onWorkChange" />
    </div>

    <div class="settings-panel__field">
      <label for="break-duration">Break (minutes, 0 = no breaks)</label>
      <input id="break-duration" v-model.number="breakDuration" type="number" min="0" @change="onBreakChange" />
    </div>

    <div class="settings-panel__field settings-panel__field--key">
      <label for="add-task-key">Add-task key (blank = off)</label>
      <input id="add-task-key" v-model="addTaskKey" type="text" maxlength="1" @change="onKeyChange" />
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.settings-panel__field {
  flex: 1 1 12rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Holds a single character, so it shouldn't stretch across the row the way the
   duration fields do. */
.settings-panel__field--key {
  flex: 0 0 auto;
}

.settings-panel__field--key input {
  width: 4rem;
}

.settings-panel__field label {
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}
</style>
