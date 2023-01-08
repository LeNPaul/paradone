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
      nodes: {
        node1: { name: "Node 1" },
        node2: { name: "Node 2" },
        node3: { name: "Node 3" },
        node4: { name: "Node 4" },
      },
      edges: {
        edge1: { source: "node1", target: "node2" },
        edge2: { source: "node2", target: "node3" },
        edge3: { source: "node3", target: "node4" },
      },
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
