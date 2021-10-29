<template>
  <p class="pb-3 border-bottom">
    <button class="btn btn-link link-dark" type="submit" v-on:click="completeTask(task.task_id)"><i @click="$emit('delete-task', task.id)" class="far fa-circle"></i></button>
    {{ task.content }}
  </p>
</template>

<script>
export default {
  name: 'Task',
  props: {
    task: Object
  }
}
</script>

<style scope>
</style>
