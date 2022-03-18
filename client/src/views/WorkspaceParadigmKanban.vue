<template>
  <TheWorkspaceHeader :title="this.$route.params.project" @update-tasks="updateTasks()"/>
  <TheWorkspaceParadigmKanbanBoard
    @delete-task="updateTasks()"
    @update-task="updateTasks()"
    :tasks="tasks"
  />
</template>

<script>
import TheWorkspaceHeader from '../components/TheWorkspaceHeader'
import TheWorkspaceParadigmKanbanBoard from '../components/TheWorkspaceParadigmKanbanBoard'

export default {
  name: 'WorkspaceParadigmKanban',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheWorkspaceHeader,
    TheWorkspaceParadigmKanbanBoard
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
        const projects = JSON.parse(localStorage.getItem('projects'))
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
    this.$store.dispatch('fetchLabels')
    this.$store.dispatch('fetchProjects')
    this.updateTasks()
  },
}
</script>
