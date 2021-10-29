<template>
  <form @submit="onSubmit" class="add-form">
    <div class="form-control">
      <label>Task</label>
      <input type="text" v-model="content" name="content" placeholder="Add Task" />
    </div>
    <input type="submit" value="Save Task" class="btn btn-block" />
  </form>
</template>

<script>
  export default {
    name: 'AddTask',
    data() {
      return {
        content: '',
      }
    },
    methods: {
      onSubmit(e) {
        e.preventDefault()
        if(!this.content) {
          alert('Please add a task')
          return
        }
        const newTask = {
          content: this.content,
        }
        this.$emit('add-task', newTask)
        this.content = ''
      }
    }
  }
</script>

<style scoped>
</style>
