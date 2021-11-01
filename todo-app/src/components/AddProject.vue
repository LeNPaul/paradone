<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="name" name="name" placeholder="Project name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'AddProject',
    data() {
      return {
        name: '',
      }
    },
    methods: {
      onSubmit(e) {
        e.preventDefault()
        if(!this.name) {
          alert('Please add a project')
          return
        }
        const newProject = {
          name: this.name
        }
        this.addProject(newProject)
        this.name = ''
        this.$emit('close-add-project')
      },
      async addProject(project) {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(project),
        })
        const data = await res.json()
        return data
      }
    }
  }
</script>

<style scoped>
</style>
