<template>
  <p class="pb-3 border-bottom" v-show="!task.completed">
    <span v-show="!showEditTask">
      <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task._id)" class="far fa-circle"></i></button>
      {{ task.title }}
      <button class="btn btn-link link-dark float-end" type="submit"><i @click="toggleEditTask()" class="fas fa-edit"></i></button>
    </span>
    <WorkspaceTaskEdit @update-task="$emit('update-task')" @close-edit-task="toggleEditTask()" v-show="showEditTask" :task="task" :tasks="tasks"/>
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
    },
    tasks: {
      type: Array,
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
    }
  },
  methods: {
    toggleEditTask() {
      this.showEditTask = !this.showEditTask
    }
  }
}
</script>
