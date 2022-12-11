<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="content" name="content" placeholder="Task content" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'TheWorkspaceHeaderTaskAdd',
    data() {
      return {
        content: '',
      }
    },
    emits: ['update-tasks', 'close-add-task'],
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.content) {
          alert('Please add a task')
          return
        }
        const newTask = {
          content: this.content,
        }
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(newTask),
        })
        const data = await res.json()
        this.$emit('update-tasks')
        this.content = ''
        return data
      }
    }
  }
</script>
