<template>
  <WorkspaceHeader @toggle-add-task="toggleAddTask" title="Eisenhower Matrix" :showAddTask="showAddTask"/>
  <EisenhowerMatrix
    @delete-task="deleteTask"
    @update-task="updateTask"
    :tasks="tasks"
  />
</template>

<script>
import WorkspaceHeader from '../components/WorkspaceHeader'
import EisenhowerMatrix from '../components/EisenhowerMatrix'
export default {
  name: 'Eisenhower',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    WorkspaceHeader,
    EisenhowerMatrix,
  },
  data() {
    return {
      tasks: [],
      showAddTask: false
    }
  },
  methods: {
    toggleAddTask() {
      this.showAddTask = !this.showAddTask
    },
    async addTask(task) {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: JSON.stringify(task),
      })
      const data = await res.json()
      this.tasks = [...this.tasks, data]
    },
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
      var filter = ''
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
