<script setup>
// DoneEntry: type what you just did, press Enter, it's recorded already ticked.
// The one-gesture alternative to "add a task, then find its checkbox" — shown
// during an active block and again at the Audit. Owns nothing but the draft;
// where the finished task lands is the parent's business.
import { ref } from 'vue'

defineProps({
  // Unique per screen, so the two usages don't collide on a duplicate id.
  inputId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['submit'])

const draft = ref('')

function onEnter() {
  const text = draft.value.trim()
  if (text === '') return
  emit('submit', text)
  draft.value = ''
}
</script>

<template>
  <div class="done-entry">
    <label :for="inputId" class="eyebrow">What did you get done?</label>
    <input
      :id="inputId"
      type="text"
      v-model="draft"
      placeholder="Type a task and press Enter"
      @keydown.enter.prevent="onEnter"
    />
  </div>
</template>

<style scoped>
.done-entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
