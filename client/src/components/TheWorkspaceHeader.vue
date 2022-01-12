<template>
  <header class="align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <button @click="toggleAddTask()" class="btn btn-link link-dark"><i class="fas fa-plus"></i></button>
    <button @click="toggleEditProject()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.project"></i></button>
    <TheWorkspaceHeaderProjectEdit v-show="showEditProject" :project="this.$route.params.project"/>
  </header>
  <TheWorkspaceHeaderTaskAdd v-show="showAddTask" @close-add-task="toggleAddTask" @update-tasks="$emit('update-tasks')"/>
</template>

<script>
import TheWorkspaceHeaderTaskAdd from '../components/TheWorkspaceHeaderTaskAdd'
import TheWorkspaceHeaderProjectEdit from './TheWorkspaceHeaderProjectEdit'

export default {
  name: 'TheWorkspaceHeader',
  props: {
    title: {
      type: String
    }
  },
  components: {
    TheWorkspaceHeaderTaskAdd,
    TheWorkspaceHeaderProjectEdit
  },
  data() {
    return {
      showAddTask: false,
      showEditProject: false
    }
  },
  emits: ['update-tasks'],
  methods: {
    toggleAddTask() {
      this.showAddTask = !this.showAddTask
    },
    toggleEditProject() {
      this.showEditProject = !this.showEditProject
    }
  },
  watch: {
    $route() {
      this.showEditProject = false
      this.showAddTask = false
    }
  }
}
</script>
