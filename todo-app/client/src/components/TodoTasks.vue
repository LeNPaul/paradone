<template>
  <div :key="task._id" v-for="task in tasks">
    <TodoTask @update-task="$emit('update-task')" @delete-task="$emit('delete-task', task._id)" :task="task"/>
  </div>
</template>

<script>
import TodoTask from './TodoTask'

export default {
  name: 'TodoTasks',
  props: {
    tasks: Array
  },
  components: {
    TodoTask,
  },
  emits: ['delete-task', 'update-task']
}
</script>
