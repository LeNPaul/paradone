<template>
  <h3 class="pb-3 mb-3 border-bottom">Urgent and Important</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.priority=='1'" @delete-task="$emit('delete-task', task.id)" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Important but Not Urgent</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.priority=='2'" @delete-task="$emit('delete-task', task.id)" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Urgent but Not Important</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.priority=='3'" @delete-task="$emit('delete-task', task.id)" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Not Urgent and Not Important</h3>
  <div :key="task.id" v-for="task in tasks">
    <Task v-if="task.priority=='4' || task.priority == ''" @delete-task="$emit('delete-task', task.id)" :task="task"/>
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
