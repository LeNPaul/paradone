<script setup>
// SettingsPanel: work/break durations, stored separately from session data
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

watch(
  () => props.prefs,
  (prefs) => {
    workDuration.value = prefs.workDuration
    breakDuration.value = prefs.breakDuration
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

.settings-panel__field label {
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}
</style>
