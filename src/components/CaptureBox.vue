<script setup>
// CaptureBox: persistent input + timestamped running list, available in every active state
import { ref } from 'vue'

defineProps({
  captures: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add'])

const draft = ref('')

function onSubmit() {
  const trimmed = draft.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  draft.value = ''
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="capture-box">
    <form @submit.prevent="onSubmit">
      <input
        v-model="draft"
        type="text"
        aria-label="Capture a distraction"
        placeholder="Capture something..."
      />
      <button type="submit">Add</button>
    </form>
    <p v-if="captures.length === 0">No captures yet.</p>
    <ul v-else class="capture-box__list">
      <li v-for="(capture, i) in captures" :key="`${capture.timestamp}-${i}`">
        <time :datetime="capture.timestamp">{{ formatTime(capture.timestamp) }}</time>
        {{ capture.text }}
      </li>
    </ul>
  </div>
</template>
