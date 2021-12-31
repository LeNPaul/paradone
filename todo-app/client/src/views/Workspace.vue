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
    async fetchProjects() {
      const res = await fetch('/api/projects', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      return data
    },
    async updateTasks() {
      let filter = ''
      if(this.$route.params.project) {
        const projects = await this.fetchProjects()
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
  watch:{
    $route (){
      this.updateTasks()
    }
  }
}
</script>
