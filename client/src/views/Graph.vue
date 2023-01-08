<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">

        <button type="button" class="btn btn-outline mb-3"  id="show-modal" @click="showModal = true">
          <i class="fas fa-plus"></i>
        </button>
        <TheWorkspaceTaskModal
          :show="showModal" @close-modal="showModal=false"
          @delete-task="updateTasks()"
          @update-tasks="updateTasks()"
          :tasks="tasks"
        />
        <v-network-graph
          id="graph-view"
          class="graph"
          :nodes="nodes"
          :edges="edges"
          :configs="configs"
        />
      </div>
    </div>
  </div>
</template>

<style>
  #graph-view {
    height: 75vh;
  }
</style>

<script>
import TheSidebar from '../components/TheSidebar'
import TheWorkspaceTaskModal from '../components/TheWorkspaceTaskModal'
const requests = require('../assets/js/requests')

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
    TheWorkspaceTaskModal
  },
  data() {
    return {
      tasks: [],
      showModal: false,
      nodes: {},
      edges: {},
      configs: {
        node: {
          normal: {
            color: "black"
          },
          hover: {
            color: "grey"
          }
        },
        edge: {
          normal: {
            color: "black"
          },
          hover: {
            color: "grey"
          }
        }
      }
    }
  },
  methods: {
    async updateTasks() {
      this.tasks = await requests.fetchTasks()
      this.tasks.forEach((task)=>{
        this.nodes[task._id] = {name: task.title}
        task.parent_ids.forEach(async (parentId)=>{
          const parentTask = await requests.fetchTask(parentId)
          this.edges[parentTask._id+task._id] = {
            source: parentTask._id,
            target: task._id
          }
        })
      })
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
