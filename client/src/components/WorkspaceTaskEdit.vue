<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="title" name="title" placeholder="Task name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'WorkspaceTaskEdit',
    data() {
      return {
        title: '',
      }
    },
    props: {
      task: {
        type: Object,
        required: true
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.title) {
          alert('Please add a task')
          return
        }
        const taskToUpdate = await this.fetchTask(this.$props.task._id)
        const updTask = {
          ...taskToUpdate,
          title: this.title
        }
        const res = await fetch(`/api/tasks/${this.$props.task._id}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(updTask),
        })
        const data = await res.json()
        this.$emit('update-task')
        this.$emit('close-edit-task')
        return data
      },
      async fetchTask(id) {
        const res = await fetch(`/api/tasks/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
        return data
      },
    },
    async created() {
      this.title = this.$props.task.title
    }
  }
</script>
