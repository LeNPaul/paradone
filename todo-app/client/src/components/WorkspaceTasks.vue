<template>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTask @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"/>
  </div>
</template>

<script>
import WorkspaceTask from './WorkspaceTask'

export default {
  name: 'WorkspaceTasks',
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
    async deleteTask(id) {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      res.status === 200
        ? this.$emit('delete-task')
        : alert('Error deleting task')
    }
  }
}
</script>
