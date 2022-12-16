<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="title" name="title" placeholder="Title" class="form-control border-0 shadow-none">
      <textarea type="text" v-model="content" name="content" placeholder="Content" class="form-control border-0 shadow-none" rows="3"></textarea>
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'TheWorkspaceHeaderTaskAdd',
    data() {
      return {
        title: null,
        content: null
      }
    },
    emits: ['update-tasks', 'close-add-task'],
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.title) {
          alert('Please add a task')
          return
        }
        const newTask = {
          title: this.title,
          content: this.content
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
        this.title = null
        this.content = null
        return data
      }
    }
  }
</script>
