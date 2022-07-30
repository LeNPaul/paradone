<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="todoistToken" name="content" placeholder="Todoist API Token" class="form-control mb-3">
      <input type="text" v-model="notionToken" name="content" placeholder="Notion API Token" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
  <p :key='task.id' v-for="task in tasks">{{task.content}}</p>
</template>

<script>
  export default {
    name: 'Sync',
    data() {
      return {
        todoistToken: '',
        notionToken: '',
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
        const tokens = {
          notionToken: this.notionToken,
          todoistToken: this.todoistToken
        }
        const res = await fetch('/api/notion', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(tokens)
        })
        const data = await res.json()
        this.tasks = data
        console.log(data)
        return data
      }
    }
  }
</script>
