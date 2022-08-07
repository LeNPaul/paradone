<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <h3>Sync Notion with Todoist</h3>
      <p>Sync any tasks in Todoist with the label "notion" to a database in Notion shared with integration with "tasks" in the title</p>
    </div>
    <div v-show="errorMessage" class="alert alert-danger mb-3" role="alert">
      {{ errorMessage }}
    </div>
    <div v-show="successMessage" class="alert alert-success mb-3" role="alert">
      {{ successMessage }}
    </div>
    <button type="submit" class="btn btn-dark">Sync</button>
  </form>
</template>

<script>
  export default {
    name: 'Sync',
    data() {
      return {
        todoistToken: '',
        notionToken: '',
        errorMessage: '',
        successMessage: ''
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        const tokens = {
          notionToken: this.notionToken,
          todoistToken: this.todoistToken
        }
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(tokens)
        })
        const data = await res.json()
        if (data.Error) {
          this.errorMessage = data.Error
        } else {
          this.successMessage = data.Success
        }
      }
    }
  }
</script>
