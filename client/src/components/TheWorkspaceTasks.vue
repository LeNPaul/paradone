<template>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTask @update-task="$emit('update-task')" @delete-task="completeTask(task._id)" :task="task" :tasks="tasks"/>
  </div>
</template>

<script>
import WorkspaceTask from './WorkspaceTask'
const requests = require('../assets/js/requests')

export default {
  name: 'TheWorkspaceTasks',
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  components: {
    WorkspaceTask,
  },
  emits: ['delete-task', 'update-task'],
  methods: {
    async completeTask(id) {
      const taskToUpdate = await requests.fetchTask(id)
      const updTask = {
        ...taskToUpdate,
        completed: true
      }
      const res = await requests.updateTask(id, updTask)
      res.status === 200
        ? this.$emit('delete-task')
        : alert('Error updating task')
    },
    async deleteTask(id) {
      const res = await requests.deleteTask(id)
      res.status === 200
        ? this.$emit('delete-task')
        : alert('Error deleting task')
    }
  }
}
</script>
