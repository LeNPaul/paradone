<script setup>
// SettingsPanel: work/break durations, the add-task shortcut key and the
// block-end alerts, stored separately from session data
import { ref, watch } from 'vue'
import { notificationPermission, requestNotificationPermission } from '../lib/notify.js'

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
const sound = ref(props.prefs.sound)
const notify = ref(props.prefs.notify)

// Read once: the browser only changes this behind a page-level permission UI,
// and re-reading on every render would say nothing new.
const permission = ref(notificationPermission())

watch(
  () => props.prefs,
  (prefs) => {
    workDuration.value = prefs.workDuration
    breakDuration.value = prefs.breakDuration
    addTaskKey.value = prefs.addTaskKey
    sound.value = prefs.sound
    notify.value = prefs.notify
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

function onSoundChange() {
  emit('update', { sound: sound.value })
}

// Switching the popup on is the user gesture the permission prompt needs. A
// refusal reverts the box rather than storing a preference the browser will
// silently ignore.
async function onNotifyChange() {
  if (!notify.value) {
    emit('update', { notify: false })
    return
  }
  permission.value = await requestNotificationPermission()
  if (permission.value !== 'granted') {
    notify.value = false
    return
  }
  emit('update', { notify: true })
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

    <div class="settings-panel__alerts">
      <div class="settings-panel__check">
        <input id="alert-sound" v-model="sound" type="checkbox" @change="onSoundChange" />
        <label for="alert-sound">Sound at block end</label>
      </div>

      <div class="settings-panel__check">
        <input
          id="alert-notify"
          v-model="notify"
          type="checkbox"
          :disabled="permission === 'unsupported'"
          @change="onNotifyChange"
        />
        <label for="alert-notify">Desktop notification</label>
      </div>

      <p v-if="permission === 'unsupported'" class="settings-panel__hint">
        This browser has no desktop notifications.
      </p>
      <p v-else-if="permission === 'denied'" class="settings-panel__hint">
        Blocked by your browser — allow notifications for this site to use this.
      </p>
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

/* Its own full-width row under the fields: these read as on/off switches, not
   as a fourth value to type into. */
.settings-panel__alerts {
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.settings-panel__check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.settings-panel__check label {
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}

.settings-panel__hint {
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}
</style>
