<template>
  <TodoWorkspace v-if="this.$store.getters.isLoggedIn" :key="$route"/>
  <AppHome v-else/>
</template>

<script>
import AppHome from '../components/AppHome'
import TodoWorkspace from '../components/TodoWorkspace'

export default {
  name: 'Main',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    AppHome,
    TodoWorkspace
  }
};
</script>
