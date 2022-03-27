<template>
  <TheWorkspaceHeader :title="this.$route.params.project" @update-tasks="updateTasks()"/>
  <TheWorkspaceParadigmEisenhowerMatrix
    @delete-task="updateTasks()"
    @update-task="updateTasks()"
    :tasks="tasks"
  />
</template>

<script>
import TheWorkspaceHeader from '../components/TheWorkspaceHeader'
import TheWorkspaceParadigmEisenhowerMatrix from '../components/TheWorkspaceParadigmEisenhowerMatrix'
export default {
  name: 'WorkspaceParadigmEisenhower',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheWorkspaceHeader,
    TheWorkspaceParadigmEisenhowerMatrix,
  },
  data() {
    return {
      tasks: [],
      showAddTask: false
    }
  },
  methods: {
    async updateTasks() {
      let filter = ''
      if(this.$route.params.project) {
        const projects = JSON.parse(this.$store.state.projects)
        const project_id = projects.find(o => o.project_name === this.$route.params.project)._id
        filter = '?project_id=' + project_id
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
