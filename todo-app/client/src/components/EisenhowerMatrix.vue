<template>
  <h3 class="pb-3 mb-3 border-bottom">Urgent and Important</h3>
  <div :key="task._id" v-for="task in tasks">
    <TodoTask v-if="task.priority=='1'" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Important but Not Urgent</h3>
  <div :key="task._id" v-for="task in tasks">
    <TodoTask v-if="task.priority=='2'" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Urgent but Not Important</h3>
  <div :key="task._id" v-for="task in tasks">
    <TodoTask v-if="task.priority=='3'" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Not Urgent and Not Important</h3>
  <div :key="task._id" v-for="task in tasks">
    <TodoTask v-if="task.priority=='4' || task.priority == ''" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
</template>

<script>
import TodoTask from './TodoTask'

export default {
  name: 'EisenhowerMatrix',
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
