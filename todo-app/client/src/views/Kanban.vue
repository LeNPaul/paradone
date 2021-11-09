<template>
  <Header @toggle-add-task="toggleAddTask" title="Kanban Board" :showAddTask="showAddTask"/>
  <AddTask v-show="showAddTask" @add-task="addTask" />
  <KanbanBoard
    @delete-task="deleteTask"
    @update-task="updateTask"
    :tasks="tasks"
  />
</template>

<script>
import Header from '../components/Header'
import KanbanBoard from '../components/KanbanBoard'
import AddTask from '../components/AddTask'
export default {
  name: 'Dashboard',
  props: {

  },
  components: {
    Header,
    KanbanBoard,
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
        },
        body: JSON.stringify(task),
      })
      const data = await res.json()
      this.tasks = [...this.tasks, data]
    },
    async deleteTask(id) {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
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
      const res = await fetch('/api/tasks' + filter)
      const data = await res.json()
      return data
    },
    async fetchTask(id) {
      const res = await fetch(`/api/tasks/${id}`)
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
