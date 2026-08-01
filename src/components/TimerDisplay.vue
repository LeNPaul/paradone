<script setup>
// TimerDisplay: countdown render (mm:ss), visually distinct primer vs. session states
import { computed } from 'vue'
import { formatMs } from '../lib/timer.js'

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

const formatted = computed(() => formatMs(props.remainingMs))
</script>

<template>
  <div class="timer-display" :class="`timer-display--${variant}`">
    <span class="timer-display__time">{{ formatted }}</span>
  </div>
</template>
