<template>
  <WorkspaceHeader :title="this.$route.params.project" @update-tasks="updateTask()"/>
  <TodoTasks
    @delete-task="deleteTask"
    @update-task="updateTask"
    :tasks="tasks"
  />
</template>

<script>
import WorkspaceHeader from '../components/WorkspaceHeader'
import TodoTasks from '../components/TodoTasks'

export default {
  name: 'App',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    WorkspaceHeader,
    TodoTasks,
  },
  data() {
    return {
      tasks: []
    }
  },
  methods: {
    async deleteTask(id) {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      res.status === 200
        ? (this.tasks = this.tasks.filter((task) => task._id !== id))
        : alert('Error deleting task')
    },
    async fetchTasks() {
      let filter = ''
      if(this.$route.params.project) {
        filter = '?project=' + this.$route.params.project
      }
      const res = await fetch('/api/tasks' + filter, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      return data
    },
    async fetchTask(id) {
      const res = await fetch(`/api/tasks/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      return data
    },
    async updateTask() {
      this.tasks = await this.fetchTasks()
    }
  },
  async created() {
    this.tasks = await this.fetchTasks()
  },
}
</script>
