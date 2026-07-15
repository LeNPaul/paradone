<script setup>
// TimerDisplay: countdown render (mm:ss), visually distinct primer vs. session states
import { computed } from 'vue'

const props = defineProps({
  remainingMs: {
    type: Number,
    required: true,
  },
  variant: {
    type: String,
    default: 'session',
    validator: (v) => ['primer', 'session'].includes(v),
  },
})

const formatted = computed(() => {
  const totalSeconds = Math.floor(props.remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
</script>

<template>
  <div class="timer-display" :class="`timer-display--${variant}`">
    <span class="timer-display__time">{{ formatted }}</span>
  </div>
</template>
