<template>
  <header class="d-flex align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <Button @btn-click="$emit('toggle-add-task')"/>
  </header>
</template>

<script>
import Button from './Button'

export default {
  name: 'Header',
  props: {
    title: String,
    showAddTask: Boolean
  },
  components: {
    Button
  }
}
</script>

<style scoped>
</style>
