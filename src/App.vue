<script setup>
import { ref } from 'vue'

// Drives the single-page state machine from spec.md §3:
// setup | primer | active | blockEnd | break | audit | summary
const state = ref('setup')
</script>

<template>
  <div class="app"></div>
</template>
