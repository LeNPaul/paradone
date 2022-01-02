<template>
  <form @submit="onSubmit" class="form-control add-form p-3 border-0">
    <div class="mb-3">
      <input type="text" v-model="label_name" name="name" placeholder="Label name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'AddLabel',
    data() {
      return {
        label_name: '',
      }
    },
    methods: {
      onSubmit(e) {
        e.preventDefault()
        if(!this.label_name) {
          alert('Please add a label')
          return
        }
        const newLabel = {
          label_name: this.label_name
        }
        this.addLabel(newLabel)
        this.label_name = ''
        this.$emit('close-add-label')
        this.$emit('update-labels')
      },
      async addLabel(newLabel) {
        const res = await fetch('/api/labels', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(newLabel),
        })
        const data = await res.json()
        return data
      }
    }
  }
</script>
