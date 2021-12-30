<template>
  <WorkspaceHeader :title="this.$route.params.project" @update-tasks="updateTasks()"/>
  <WorkspaceTasks
    @delete-task="updateTasks()"
    @update-task="updateTasks()"
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
    async updateTasks() {
      let filter = ''
      if(this.$route.params.project) {
        filter = '?project=' + this.$route.params.project
      }
      const res = await fetch('/api/tasks' + filter, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      this.tasks = await res.json()
    }
  },
  async created() {
    this.updateTasks()
  },
}
</script>
