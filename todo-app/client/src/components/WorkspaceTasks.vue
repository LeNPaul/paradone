<template>
  <div :key="task._id" v-for="task in tasks">
    <TodoTask @update-task="$emit('update-task')" @delete-task="$emit('delete-task', task._id)" :task="task"/>
  </div>
</template>

<script>
import TodoTask from './TodoTask'

export default {
  name: 'WorkspaceTasks',
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  components: {
    TodoTask,
  },
  emits: ['delete-task', 'update-task']
}
</script>
