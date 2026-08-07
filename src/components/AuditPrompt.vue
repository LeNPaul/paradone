<script setup>
// AuditPrompt: what got done, focused/distracted/mixed. Quick-select + optional free text.
import { computed, ref } from 'vue'
import MarkdownChecklist from './MarkdownChecklist.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { removeChecked } from '../lib/checklist.js'

const props = defineProps({
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

const emit = defineEmits(['submit', 'skip', 'discard'])

// The Audit screen is a before/after read: completed work belongs under
// "Completed this session", so the list below it shows only what's left.
// Frozen when the screen mounts rather than computed off the prop — a tick
// rewrites the draft in place, so the row stays on screen, checked, and a
// mis-click can be undone before the audit is finished.
const draft = ref(removeChecked(props.taskListText).text)

// The draft started with every checked line stripped, so anything checked in it
// now was ticked here, at the audit. The parent merges these back into the
// persistent Task List when the audit is finished.
const checkedTasks = computed(() => removeChecked(draft.value).removed)

const auditProductive = ref('')
const auditNotes = ref('')

const confirmingDiscard = ref(false)

function onSubmit() {
  emit('submit', {
    auditProductive: auditProductive.value,
    auditNotes: auditNotes.value.trim(),
    checkedTasks: checkedTasks.value,
  })
}

function onSkip() {
  emit('skip', { checkedTasks: checkedTasks.value })
}

function onConfirmDiscard() {
  confirmingDiscard.value = false
  emit('discard', { checkedTasks: checkedTasks.value })
}
</script>

<template>
  <div class="audit-prompt">
    <section class="audit-prompt__block" aria-labelledby="audit-completed-heading">
      <h3 id="audit-completed-heading" class="eyebrow">Completed this session</h3>
      <ul v-if="completedTasks.length" class="list-reset audit-prompt__completed">
        <li v-for="task in completedTasks" :key="task">{{ task }}</li>
      </ul>
      <p v-else class="audit-prompt__empty">No tasks checked off this session.</p>
    </section>

    <section class="audit-prompt__block" aria-labelledby="audit-goal-heading">
      <h3 id="audit-goal-heading" class="eyebrow">Task list</h3>
      <MarkdownChecklist
        v-if="draft"
        :model-value="draft"
        :editable="false"
        @update:model-value="draft = $event"
      />
      <p v-else class="audit-prompt__empty">Nothing left on the list.</p>
    </section>

    <section class="audit-prompt__block" aria-labelledby="audit-capture-heading">
      <h3 id="audit-capture-heading" class="eyebrow">Captures</h3>
      <pre class="audit-prompt__capture">{{ capture.trim() || 'No captures recorded.' }}</pre>
    </section>

    <div class="audit-prompt__block">
      <label for="audit-notes" class="eyebrow">What actually got done?</label>
      <textarea id="audit-notes" v-model="auditNotes"></textarea>
    </div>

    <fieldset class="audit-prompt__block audit-prompt__rating">
      <legend class="eyebrow">Focused, distracted, or mixed?</legend>
      <div class="segmented">
        <label class="segmented__option">
          <input type="radio" value="focused" v-model="auditProductive" />
          <span>Focused</span>
        </label>
        <label class="segmented__option">
          <input type="radio" value="distracted" v-model="auditProductive" />
          <span>Distracted</span>
        </label>
        <label class="segmented__option">
          <input type="radio" value="mixed" v-model="auditProductive" />
          <span>Mixed</span>
        </label>
      </div>
    </fieldset>

    <div class="audit-prompt__actions">
      <button type="button" class="btn-quiet audit-prompt__discard" @click="confirmingDiscard = true">
        Discard session
      </button>
      <button type="button" class="btn-quiet" @click="onSkip">Skip</button>
      <button type="button" class="btn-primary" :disabled="!auditProductive" @click="onSubmit">
        Continue
      </button>
    </div>

    <ConfirmDialog
      :open="confirmingDiscard"
      title="Discard session?"
      message="This block won't be added to your audit log. Tasks you ticked off stay ticked. This cannot be undone."
      confirm-label="Discard"
      @confirm="onConfirmDiscard"
      @close="confirmingDiscard = false"
    />
  </div>
</template>

<style scoped>
.audit-prompt {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.audit-prompt__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: none;
}

.audit-prompt__completed {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.audit-prompt__completed li::before {
  content: '✓';
  color: var(--accent);
  margin-right: var(--space-2);
}

.audit-prompt__empty {
  color: var(--ink-muted);
}

.audit-prompt__capture {
  background: var(--surface-sunken);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  color: var(--ink-secondary);
}

.audit-prompt__rating legend {
  padding: 0;
  margin-bottom: var(--space-2);
}

/* Real radios, styled as a segmented control: the input is hidden but still
   focusable and still the thing the tests and screen readers see. */
.segmented {
  display: flex;
  gap: var(--space-1);
  background: var(--control);
  border-radius: var(--radius-full);
  padding: var(--space-1);
}

.segmented__option {
  flex: 1;
}

.segmented__option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.segmented__option span {
  display: block;
  text-align: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--ink-secondary);
  transition: background var(--duration), color var(--duration);
}

.segmented__option input:checked + span {
  background: var(--control-raised);
  color: var(--ink);
  font-weight: 600;
  box-shadow: var(--shadow-card);
}

.segmented__option input:focus-visible + span {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.audit-prompt__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-3);
}

/* Pushed to the far edge: throwing the block away isn't a third way of
   answering the audit, so it shouldn't sit beside Skip and Continue. */
.audit-prompt__discard {
  margin-right: auto;
}
</style>
