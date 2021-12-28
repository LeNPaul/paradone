<template>
  <header class="align-items-center pb-3 mb-3 border-bottom">
    <span class="fs-4">{{ title }}</span>
    <button @click="toggleAddTask()" class="btn btn-link link-dark"><i class="fas fa-plus"></i></button>
    <button @click="toggleEditProject()" class="btn btn-link link-dark float-end"><i class="fas fa-ellipsis-v" v-show="this.$route.params.project"></i></button>
    <EditProject v-show="showEditProject" :project="this.$route.params.project"/>
  </header>
  <AddTask v-show="showAddTask" @close-add-task="toggleAddTask" @update-tasks="$emit('update-tasks')"/>
</template>

<script>
import AddTask from '../components/AddTask'
import EditProject from './EditProject'

export default {
  name: 'WorkspaceHeader',
  props: {
    title: {
      type: String
    }
  },
  components: {
    AddTask,
    EditProject
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
  }
}
</script>
