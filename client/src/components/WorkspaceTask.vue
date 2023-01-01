<template>
  <p class="pb-3 border-bottom">
    <span>
      <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task._id)" class="far fa-circle"></i></button>
      {{ task.title }}
      <button class="btn btn-link link-dark float-end" type="button" @click="showModal=true"><i class="fas fa-edit"></i></button>
    </span>
    <TheWorkspaceTaskModal
      :show="showModal" @close-modal="showModal=false"
      @delete-task="$emit('update-task')"
      @update-tasks="$emit('update-task')"
      :task="task"
      :tasks="tasks"
    />
  </p>
</template>

<script>
import TheWorkspaceTaskModal from '../components/TheWorkspaceTaskModal'

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
    TheWorkspaceTaskModal
  },
  emits: ['update-task', 'delete-task'],
  data() {
    return {
      showModal: false
    }
  }
}
</script>
