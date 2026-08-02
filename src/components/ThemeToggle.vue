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
      Light
    </button>
    <button
      type="button"
      class="theme-toggle__option"
      :aria-pressed="theme === 'dark'"
      @click="$emit('update', 'dark')"
    >
      Dark
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
  background: none;
  border-color: transparent;
  color: var(--ink-secondary);
  font-size: var(--text-sm);
  padding: var(--space-1) var(--space-3);
}

.theme-toggle__option:hover:not([aria-pressed='true']) {
  background: none;
  color: var(--ink);
}

/* The selected segment reads as a thumb lifted off the track. */
.theme-toggle__option[aria-pressed='true'] {
  background: var(--control-raised);
  color: var(--ink);
  font-weight: 600;
}
</style>
