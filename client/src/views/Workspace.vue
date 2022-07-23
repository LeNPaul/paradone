<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <TheWorkspaceHeader :title="this.$route.params.project || this.$route.params.label" @update-tasks="updateTasks()"/>
        <TheWorkspaceTasks
          @delete-task="updateTasks()"
          @update-task="updateTasks()"
          :tasks="tasks"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from '../components/TheSidebar'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
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
        const projects = this.$store.state.projects
        const project_id = projects.find(o => o.project_name === this.$route.params.project)._id
        filter = '?project_id=' + project_id
      }
      if(this.$route.params.label) {
        const labels = this.$store.state.labels
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
    this.updateTasks()
  },
  watch:{
    $route (){
      if(this.$store.getters.isLoggedIn) {
        this.updateTasks()
      }
    }
  }
}
</script>
