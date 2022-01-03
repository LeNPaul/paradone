<template>
  <div class="card mb-3 px-3">
    <div class="card-body">
      <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task._id)" class="far fa-circle"></i></button>
      {{ task.content }}
      <button class="btn btn-link link-dark float-end" type="submit"><i @click="toggleEditTask()" class="fas fa-edit"></i></button>
    </div>
    <WorkspaceTaskEdit @update-task="$emit('update-task')" @close-edit-task="toggleEditTask()" v-show="showEditTask" :task="task"/>
  </div>
</template>

<script>
import WorkspaceTaskEdit from './WorkspaceTaskEdit'

export default {
  name: 'WorkspaceParadigmKanbanCard',
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
      showEditTask: false
    }
  },
  methods: {
    toggleEditTask() {
      this.showEditTask = !this.showEditTask
    },
  }
}
</script>
