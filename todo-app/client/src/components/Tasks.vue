<template>
  <div :key="task.id" v-for="task in tasks">
    <Task @update-task="$emit('update-task')" @delete-task="$emit('delete-task', task.id)" :task="task"/>
  </div>
</template>

<script>
import Task from './Task'

export default {
  name: 'Tasks',
  props: {
    tasks: Array
  },
  components: {
    Task,
  },
  emits: ['delete-task', 'update-task']
}
</script>
