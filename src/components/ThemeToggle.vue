<script setup>
// ThemeToggle: light/dark segmented control. Persisting the choice is the
// parent's job — this only reports which segment was pressed.
defineProps({
  theme: {
    type: String,
    required: true,
  },
})

defineEmits(['update'])
</script>

<template>
  <div class="theme-toggle" role="group" aria-label="Theme">
    <button
      type="button"
      class="theme-toggle__option"
      :aria-pressed="theme === 'light'"
      @click="$emit('update', 'light')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"
        />
      </svg>
      <span class="sr-only">Light</span>
    </button>
    <button
      type="button"
      class="theme-toggle__option"
      :aria-pressed="theme === 'dark'"
      @click="$emit('update', 'dark')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.8A8.6 8.6 0 0 1 9.2 3.5a8.6 8.6 0 1 0 11.3 11.3Z" />
      </svg>
      <span class="sr-only">Dark</span>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--control);
  border-radius: var(--radius-full);
}

.theme-toggle__option {
  display: grid;
  place-items: center;
  background: none;
  border-color: transparent;
  color: var(--ink-secondary);
  padding: var(--space-1) var(--space-3);
}

/* currentColor lets the rules below tint the glyph without repeating themselves. */
.theme-toggle__option svg {
  width: 1.125rem;
  height: 1.125rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.theme-toggle__option:hover:not([aria-pressed='true']) {
  background: none;
  color: var(--ink);
}

/* The selected segment reads as a thumb lifted off the track. */
.theme-toggle__option[aria-pressed='true'] {
  background: var(--control-raised);
  color: var(--ink);
}
</style>
