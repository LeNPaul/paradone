<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <TheWorkspaceTaskAdd 
          @update-tasks="updateTasks()" 
          :tasks="tasks"
        />
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
import TheWorkspaceTaskAdd from '../components/TheWorkspaceTaskAdd'
import TheWorkspaceTasks from '../components/TheWorkspaceTasks'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
    TheWorkspaceTaskAdd,
    TheWorkspaceTasks
  },
  data() {
    return {
      tasks: []
    }
  },
  methods: {
    async updateTasks() {
      const res = await fetch('/api/tasks', {
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
        console.log('isLoggedIn')
      }
    }
  }
}
</script>
