<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <button v-show="checked" @click="()=>{checked = false}" type="button" class="btn btn-success">Stop Channel</button>
      <button v-show="!checked" @click="()=>{checked = true}" type="button" class="btn btn-danger">Start Channel</button>
    </div>
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
    name: 'IntegrationAdd',
    data() {
      return {
        checked: false,
        source: '',
        destination: '',
        query: '',
        modifier: '',
        errorMessage: '',
        successMessage: ''
      }
    },
    props: {
      integration: {
        type: Object,
        required: true
      }
    },
    methods: {
      test() {
        console.log('asf')
      },
      async onSubmit(e) {
        e.preventDefault()

        const integration = {
          isActive: this.checked,
          source: this.source,
          destination: this.destination,
          query: this.query,
          modifier: this.modifier
        }

        const res = await fetch(`/api/integrations/${this.$props.integration._id}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(integration),
        })
        const data = await res.json()
        this.$emit('update-integrations')
        this.$emit('close-edit-integration')
        return data
      }
    },
    emits: ['close-edit-integration', 'update-integrations'],
    async created() {
      this.checked = this.$props.integration.is_active
      this.source = this.$props.integration.source
      this.query = this.$props.integration.source_query
      this.destination = this.$props.integration.destination
      this.modifier = this.$props.integration.destination_modifier
    }
  }
</script>
