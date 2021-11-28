<template>
  <header class="align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <ToggleButton @btn-click="$emit('toggle-add-task')"/>
    <button @click="toggleEditProject()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.project"></i></button>
    <EditProject v-show="showEditProject" :project="this.$route.params.project"/>
  </header>
</template>

<script>
import ToggleButton from './ToggleButton'
import EditProject from './EditProject'

export default {
  name: 'DashboardHeader',
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
    ToggleButton,
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
