<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="content" name="content" placeholder="Content" class="form-control">
      <input type="text" v-model="token" name="content" placeholder="Token" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
  <p :key='task.id' v-for="task in tasks">{{task.content}}</p>
</template>

<script>
  export default {
    name: 'Todoist',
    data() {
      return {
        token: '',
        content: '',
        tasks: []
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.token) {
          alert('Please add a task')
          return
        }
        const token = {
          token: this.token,
          content: this.content
        }
        const res = await fetch('/api/notion', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(token)
        })
        const data = await res.json()
        this.tasks = data
        console.log(data)
        return data
      }
    }
  }
</script>
