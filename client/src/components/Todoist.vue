<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="token" name="content" placeholder="Task content" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'Todoist',
    data() {
      return {
        token: ''
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
          token: this.token
        }
        const res = await fetch('/api/todoist', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(token)
        })
        const data = await res.json()
        console.log(data)
        return data
      }
    }
  }
</script>
