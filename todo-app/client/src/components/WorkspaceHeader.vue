<template>
  <header class="align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>

    <button @click="$emit('toggle-add-task')" class="btn btn-link link-dark"><i class="fas fa-plus"></i></button>

    <button @click="toggleEditProject()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.project"></i></button>
    <EditProject v-show="showEditProject" :project="this.$route.params.project"/>
  </header>
</template>

<script>
import EditProject from './EditProject'

export default {
  name: 'WorkspaceHeader',
  props: {
    title: {
      type: String
    },
    showAddTask: {
      type: Boolean,
      required: true
    }
  },
  components: {
    EditProject
  },
  data() {
    return {
      showEditProject: false
    }
  },
  methods: {
    toggleEditProject() {
      this.showEditProject = !this.showEditProject
    }
  }
}
</script>
