<template>
  <WorkspaceHeader :title="this.$route.params.project" @update-tasks="updateTask()"/>
  <WorkspaceTasks
    @delete-task="updateTask()"
    @update-task="updateTask()"
    :tasks="tasks"
  />
</template>

<script>
import WorkspaceHeader from '../components/WorkspaceHeader'
import WorkspaceTasks from '../components/WorkspaceTasks'

export default {
  name: 'App',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    WorkspaceHeader,
    WorkspaceTasks,
  },
  data() {
    return {
      tasks: []
    }
  },
  methods: {
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
