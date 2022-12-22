<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <TheWorkspaceTaskModal/>
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
import TheWorkspaceTaskModal from '../components/TheWorkspaceTaskModal'
import TheWorkspaceTasks from '../components/TheWorkspaceTasks'
const requests = require('../assets/js/requests')

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
    TheWorkspaceTaskAdd,
    TheWorkspaceTaskModal,
    TheWorkspaceTasks
  },
  data() {
    return {
      tasks: []
    }
  },
  methods: {
    async updateTasks() {
      this.tasks = await requests.fetchTasks()
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
