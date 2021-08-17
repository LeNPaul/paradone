<template>
  <div>
    <sidebar/>
    <todo-list/>
  </div>
</template>

<script>
import TodoList from './components/TodoList.vue'
import Sidebar from './components/Sidebar.vue'

export default {
  name: 'App',
  components: {
    TodoList,
    Sidebar
  }
}
</script>

<style>

</style>
