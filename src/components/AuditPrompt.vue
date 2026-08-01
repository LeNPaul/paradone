<script setup>
// AuditPrompt: what got done, focused/distracted/mixed. Quick-select + optional free text.
import { ref } from 'vue'
import MarkdownChecklist from './MarkdownChecklist.vue'

defineProps({
  taskListText: {
    type: String,
    default: '',
  },
  completedTasks: {
    type: Array,
    default: () => [],
  },
  capture: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'skip'])

const auditProductive = ref('')
const auditNotes = ref('')

function onSubmit() {
  emit('submit', { auditProductive: auditProductive.value, auditNotes: auditNotes.value.trim() })
}
</script>

<template>
  <div class="audit-prompt">
    <section aria-labelledby="audit-completed-heading">
      <h3 id="audit-completed-heading">Completed this session</h3>
      <ul v-if="completedTasks.length">
        <li v-for="task in completedTasks" :key="task">{{ task }}</li>
      </ul>
      <p v-else>No tasks checked off this session.</p>
    </section>

    <section aria-labelledby="audit-goal-heading">
      <h3 id="audit-goal-heading">Task list</h3>
      <MarkdownChecklist :model-value="taskListText" :editable="false" />
    </section>

    <section aria-labelledby="audit-capture-heading">
      <h3 id="audit-capture-heading">Captures</h3>
      <pre>{{ capture.trim() || 'No captures recorded.' }}</pre>
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
    <button type="button" @click="emit('skip')">Skip</button>
  </div>
</template>
