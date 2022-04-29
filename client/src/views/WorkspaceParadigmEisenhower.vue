<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <TheWorkspaceHeader :title="this.$route.params.project" @update-tasks="updateTasks()"/>
        <TheWorkspaceParadigmEisenhowerMatrix
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
import TheWorkspaceHeader from '../components/TheWorkspaceHeader'
import TheWorkspaceParadigmEisenhowerMatrix from '../components/TheWorkspaceParadigmEisenhowerMatrix'
export default {
  name: 'WorkspaceParadigmEisenhower',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
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
        const projects = this.$store.state.projects
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
