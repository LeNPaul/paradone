<script setup>
// AuditPrompt: what got done, focused/distracted/mixed. Quick-select + optional free text.
import { ref } from 'vue'
import MarkdownChecklist from './MarkdownChecklist.vue'

defineProps({
  taskListText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit'])

const auditProductive = ref('')
const auditNotes = ref('')

function onSubmit() {
  emit('submit', { auditProductive: auditProductive.value, auditNotes: auditNotes.value.trim() })
}
</script>

<template>
  <div class="audit-prompt">
    <section aria-labelledby="audit-goal-heading">
      <h3 id="audit-goal-heading">Task list</h3>
      <MarkdownChecklist :model-value="taskListText" :editable="false" />
    </section>

    <div>
      <label for="audit-notes">What actually got done?</label>
      <textarea id="audit-notes" v-model="auditNotes"></textarea>
    </div>

    <fieldset>
      <legend>Focused, distracted, or mixed?</legend>
      <label><input type="radio" value="focused" v-model="auditProductive" /> Focused</label>
      <label><input type="radio" value="distracted" v-model="auditProductive" /> Distracted</label>
      <label><input type="radio" value="mixed" v-model="auditProductive" /> Mixed</label>
    </fieldset>

    <button type="button" :disabled="!auditProductive" @click="onSubmit">Continue</button>
  </div>
</template>
