<template>
  <header class="align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <button @click="toggleAddTask()" class="btn btn-link link-dark"><i class="fas fa-plus"></i></button>
    <button @click="toggleEditProject()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.project"></i></button>
    <TheWorkspaceHeaderProjectEdit v-show="showEditProject" :project="this.$route.params.project"/>

    <button @click="toggleEditLabel()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.label"></i></button>
    <TheWorkspaceHeaderLabelEdit v-show="showEditLabel" :label="this.$route.params.label"/>

  </header>
  <TheWorkspaceHeaderTaskAdd v-show="showAddTask" @close-add-task="toggleAddTask" @update-tasks="$emit('update-tasks')"/>
</template>

<script>
import TheWorkspaceHeaderTaskAdd from '../components/TheWorkspaceHeaderTaskAdd'
import TheWorkspaceHeaderProjectEdit from './TheWorkspaceHeaderProjectEdit'
import TheWorkspaceHeaderLabelEdit from './TheWorkspaceHeaderLabelEdit'

export default {
  name: 'TheWorkspaceHeader',
  props: {
    title: {
      type: String
    }
  },
  components: {
    TheWorkspaceHeaderTaskAdd,
    TheWorkspaceHeaderProjectEdit,
    TheWorkspaceHeaderLabelEdit
  },
  data() {
    return {
      showAddTask: false,
      showEditProject: false,
      showEditLabel: false
    }
  },
  emits: ['update-tasks'],
  methods: {
    toggleAddTask() {
      this.showAddTask = !this.showAddTask
    },
    toggleEditProject() {
      this.showEditProject = !this.showEditProject
    },
    toggleEditLabel() {
      this.showEditLabel = !this.showEditLabel
    }
  },
  watch: {
    $route() {
      this.showEditProject = false
      this.showEditLabel = false
      this.showAddTask = false
    }
  }
}
</script>
