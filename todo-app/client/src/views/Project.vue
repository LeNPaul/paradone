<template>
  <TodoWorkspace :key="$route"/>
</template>

<script>
import TodoWorkspace from '../components/TodoWorkspace'

export default {
  name: 'Project',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TodoWorkspace
  }
};
</script>
