<template>
  <div class="card mb-3">
    <div class="card-body d-inline-block text-truncate" style="max-width: 280px;">
      <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task._id)" class="far fa-circle"></i></button>
      {{ task.content }}
      <button v-show="project_name" type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ project_name }}</button>
      <button v-show="task.priority" type="button" class="btn btn-outline-dark p-1 ms-2 px-2" disabled>{{ task.priority }}</button>
      <button class="btn btn-link link-dark float-end" type="submit"><i @click="toggleEditTask()" class="fas fa-edit"></i></button>
    </div>
    <WorkspaceTaskEdit @update-task="$emit('update-task')" @close-edit-task="toggleEditTask()" v-show="showEditTask" :task="task"/>
  </div>
</template>

<script>
import WorkspaceTaskEdit from './WorkspaceTaskEdit'

export default {
  name: 'WorkspaceParadigmTask',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  components: {
    WorkspaceTaskEdit
  },
  emits: ['update-task', 'delete-task', 'close-edit-task'],
  data() {
    return {
      showEditTask: false,
      projects: [],
      project_name: ''
    }
  },
  methods: {
    toggleEditTask() {
      this.showEditTask = !this.showEditTask
    },
    async resetTask() {
      this.projects = JSON.parse(this.$store.state.projects)
      let project = this.projects.find(o => o._id === this.$props.task.project_id)
      this.project_name = project ? project.project_name : ''
    }
  },
  watch: {
    task: function() {
      this.resetTask()
    }
  },
  created() {
    this.resetTask()
  }
}
</script>
