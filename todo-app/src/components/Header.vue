<template>
  <header class="d-flex align-items-center pb-3 mb-5 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <Button v-show="homePage" @btn-click="$emit('toggle-add-task')"/>
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
  },
  computed: {
    homePage() {
      if(this.$route.path === '/') {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped>
</style>
