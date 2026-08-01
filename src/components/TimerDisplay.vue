<script setup>
// TimerDisplay: countdown render (mm:ss) inside a progress ring,
// visually distinct primer vs. session states
import { computed } from 'vue'
import { formatMs } from '../lib/timer.js'

const props = defineProps({
  remainingMs: {
    type: Number,
    required: true,
  },
  totalMs: {
    type: Number,
    default: 0,
  },
  variant: {
    type: String,
    default: 'session',
    validator: (v) => ['primer', 'session'].includes(v),
  },
  label: {
    type: String,
    default: '',
  },
})

// Geometry in SVG user units; the element is scaled by CSS, so these are
// arbitrary but fixed — the ring is drawn in a 100x100 box.
const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const formatted = computed(() => formatMs(props.remainingMs))

// 0 = nothing elapsed, 1 = fully elapsed. A zero total would divide by zero;
// treat it as "not started" so the ring reads full rather than blank.
const elapsedFraction = computed(() => {
  if (props.totalMs <= 0) return 0
  const remaining = Math.min(Math.max(props.remainingMs, 0), props.totalMs)
  return 1 - remaining / props.totalMs
})

// The arc shrinks as time is spent, so the ring drains clockwise.
const dashOffset = computed(() => CIRCUMFERENCE * elapsedFraction.value)
</script>

<template>
  <div class="timer-display" :class="`timer-display--${variant}`">
    <svg class="timer-display__ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="timer-display__track" cx="50" cy="50" :r="RADIUS" />
      <circle
        class="timer-display__progress"
        cx="50"
        cy="50"
        :r="RADIUS"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div class="timer-display__readout">
      <span class="timer-display__time">{{ formatted }}</span>
      <span v-if="label" class="timer-display__label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.timer-display {
  position: relative;
  display: grid;
  place-items: center;
  width: min(20rem, 72vw);
  aspect-ratio: 1;
  margin-inline: auto;
}

.timer-display__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Start the arc at twelve o'clock instead of three. */
  transform: rotate(-90deg);
}

.timer-display__track,
.timer-display__progress {
  fill: none;
  stroke-width: 4;
}

.timer-display__track {
  stroke: var(--accent-track);
}

.timer-display__progress {
  stroke: var(--accent);
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration) linear;
}

.timer-display__readout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.timer-display__time {
  font-size: var(--text-timer);
  font-weight: 600;
  letter-spacing: -0.03em;
  /* Without this the digits reflow every second. */
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.timer-display__label {
  font-size: var(--text-lg);
  color: var(--ink-muted);
}

/* The primer is a smaller, quieter commitment than a full block. */
.timer-display--primer {
  width: min(14rem, 60vw);
}

.timer-display--primer .timer-display__time {
  font-size: var(--text-xl);
}

.timer-display--primer .timer-display__label {
  font-size: var(--text-sm);
}
</style>
