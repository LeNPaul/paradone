<template>
  <p class="pb-3 border-bottom">
    <button class="btn btn-link link-dark" type="submit"><i @click="$emit('delete-task', task.id)" class="far fa-circle"></i></button>
    {{ task.content }}
    <button class="btn btn-link link-dark float-end" type="submit"><i @click="toggleEditTask()" class="fas fa-edit"></i></button>
    <EditTask @update-task="$emit('update-task')" @close-edit-task="toggleEditTask()" v-show="showEditTask" :task="task"/>
  </p>
</template>

<script>
import EditTask from './EditTask'

export default {
  name: 'Task',
  props: {
    task: Object
  },
  components: {
    EditTask
  },
  emits: ['update-task', 'close-edit-task'],
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

<style scope>
</style>
