<template>
  <h3 class="pb-3 mb-3 border-bottom">To Do</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.label=='To Do'" @delete-task="$emit('delete-task', task.id)" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Doing</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.label=='Doing'" @delete-task="$emit('delete-task', task.id)" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Done</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.label=='Done'" @delete-task="$emit('delete-task', task.id)" :task="task"/>
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
  emits: ['delete-task'],
}
</script>
