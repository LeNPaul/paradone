<template>
  <TheWorkspaceHeader :title="this.$route.params.project || this.$route.params.label" @update-tasks="updateTasks()"/>
  <TheWorkspaceTasks
    @delete-task="updateTasks()"
    @update-task="updateTasks()"
    :tasks="tasks"
  />
</template>

<script>
import TheWorkspaceHeader from '../components/TheWorkspaceHeader'
import TheWorkspaceTasks from '../components/TheWorkspaceTasks'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheWorkspaceHeader,
    TheWorkspaceTasks,
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
        const projects = JSON.parse(localStorage.getItem('projects'))
        const project_id = projects.find(o => o.project_name === this.$route.params.project)._id
        filter = '?project_id=' + project_id
      }
      if(this.$route.params.label) {
        const labels = JSON.parse(localStorage.getItem('labels'))
        const label_id = labels.find(o => o.label_name.toLowerCase().replace(/\s/g, '') === this.$route.params.label)._id
        filter = '?label_id=' + label_id
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
  watch:{
    $route (){
      this.updateTasks()
    }
  }
}
</script>
