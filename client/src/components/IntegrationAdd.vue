<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <h3 class="mb-3">Add integration</h3>
    <div class="mb-3">
      <h5 class="mb-3">Source</h5>
      <select class="form-select" v-model="source">
        <option selected>Select source component</option>
        <option value="notion">Notion</option>
        <option value="todoist">Todoist</option>
      </select>
    </div>
    <div class="mb-3">
      <p>Query</p>
      <input v-model="query" type="text" class="form-control">
    </div>
    <div class="mb-3">
      <h5 class="mb-3">Destination</h5>
      <select class="form-select" v-model="destination">
        <option selected>Select destination component</option>
        <option value="notion">Notion</option>
        <option value="todoist">Todoist</option>
      </select>
    </div>
    <div class="mb-3">
      <p>Modifier</p>
      <input v-model="modifier" type="text" class="form-control">
    </div>
    <div v-show="errorMessage" class="alert alert-danger mb-3" role="alert">
      {{ errorMessage }}
    </div>
    <div v-show="successMessage" class="alert alert-success mb-3" role="alert">
      {{ successMessage }}
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'Sync',
    data() {
      return {
        source: '',
        destination: '',
        query: '',
        modifier: '',
        errorMessage: '',
        successMessage: ''
      }
    },
    emits: ['close-add-integration'],
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        const configuration = {
          source: this.source,
          destination: this.destination,
          query: this.query,
          modifier: this.modifier
        }
        const res = await fetch('/api/integrations', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(configuration)
        })
        const data = await res.json()
        if (data.Error) {
          this.errorMessage = data.Error
        } else {
          this.successMessage = data.Success
        }
        this.source = ''
        this.destination = ''
        this.query = ''
        this.modifier = ''
        this.$emit('close-add-integration')
      }
    }
  }
</script>
