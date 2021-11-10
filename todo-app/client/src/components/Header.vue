<template>
  <header class="align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <Button @btn-click="$emit('toggle-add-task')"/>
    <button @click="toggleEditProject()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.project"></i></button>
    <EditProject v-show="showEditProject" :project="this.$route.params.project"/>
  </header>
</template>

<script>
import Button from './Button'
import EditProject from './EditProject'

export default {
  name: 'Header',
  props: {
    title: String,
    showAddTask: Boolean
  },
  components: {
    Button,
    EditProject
  },
  data() {
    return {
      showEditProject: false
    }
  },
  methods: {
    toggleEditProject() {
      console.log(this.$route.params.project)
      this.showEditProject = !this.showEditProject
    }
  }
}
</script>

<style scoped>
</style>
