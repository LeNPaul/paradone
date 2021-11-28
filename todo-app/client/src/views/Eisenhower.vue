<template>
  <DashboardHeader @toggle-add-task="toggleAddTask" title="Eisenhower Matrix" :showAddTask="showAddTask"/>
  <AddTask v-show="showAddTask" @add-task="addTask" />
  <EisenhowerMatrix
    @delete-task="deleteTask"
    @update-task="updateTask"
    :tasks="tasks"
  />
</template>

<script>
import DashboardHeader from '../components/DashboardHeader'
import EisenhowerMatrix from '../components/EisenhowerMatrix'
import AddTask from '../components/AddTask'
export default {
  name: 'Eisenhower',
  components: {
    DashboardHeader,
    EisenhowerMatrix,
    AddTask,
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
