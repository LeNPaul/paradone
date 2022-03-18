<template>
  <p class="pb-3 border-bottom">
    <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task._id)" class="far fa-circle"></i></button>
    {{ task.content }}
    <button v-show="project_name" type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ project_name }}</button>
    <button v-show="label_name" type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ label_name }}</button>
    <button v-show="task.priority" type="button" class="btn btn-outline-dark p-1 ms-2 px-2" disabled>{{ task.priority }}</button>
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
      project_name: '',
      labels: [],
      label_name: ''
    }
  },
  methods: {
    toggleEditTask() {
      this.showEditTask = !this.showEditTask
    },
    async fetchLabel(id) {
      const res = await fetch(`/api/labels/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      return data
    },
    async resetTask() {
      this.projects = this.projects = JSON.parse(localStorage.getItem('projects'))
      let project = this.projects.find(o => o._id === this.$props.task.project_id)
      this.project_name = project ? project.project_name : ''
      if(this.$props.task.label_ids[0]) {
        this.labels = JSON.parse(localStorage.getItem('labels'))
        let label = await this.fetchLabel(this.$props.task.label_ids[0])
        this.label_name = label.label_name
      }
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
