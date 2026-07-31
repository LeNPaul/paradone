<script setup>
// CaptureBox: freeform scratchpad textarea, available in every active state
const capture = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="capture-box">
    <textarea
      v-model="capture"
      aria-label="Capture"
      placeholder="Capture something..."
    />
  </div>
</template>
