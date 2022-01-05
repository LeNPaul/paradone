<template>
  <p class="pb-3 border-bottom">
    <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task._id)" class="far fa-circle"></i></button>
    {{ task.content }}
    <button v-show="project_name" type="button" class="btn btn-outline-dark p-1 mx-2" disabled>{{ project_name }}</button>
    <button class="btn btn-link link-dark float-end" type="submit"><i @click="toggleEditTask()" class="fas fa-edit"></i></button>
    <WorkspaceTaskEdit @update-task="$emit('update-task')" @close-edit-task="toggleEditTask()" v-show="showEditTask" :task="task"/>
  </p>
</template>

<script>
import WorkspaceTaskEdit from './WorkspaceTaskEdit'

export default {
  name: 'WorkspaceTask',
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
    async fetchProjects() {
      const res = await fetch('/api/projects', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      return data
    },
    async resetTask() {
      this.projects = await this.fetchProjects()
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
