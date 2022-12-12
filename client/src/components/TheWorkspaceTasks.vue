<template>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTask @update-task="$emit('update-task')" @delete-task="completeTask(task._id)" :task="task"/>
  </div>
</template>

<script>
import WorkspaceTask from './WorkspaceTask'

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
      const taskToUpdate = await this.fetchTask(id)
        const updTask = {
          ...taskToUpdate,
          completed: true
        }
        const res = await fetch(`/api/tasks/` + id, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(updTask),
        })
        res.status === 200
        ? this.$emit('delete-task')
        : alert('Error updating task')
    },
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
    },
    // TODO: Move this to a shared module
    async fetchTask(id) {
        const res = await fetch(`/api/tasks/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
        return data
      },
  }
}
</script>
