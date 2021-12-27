<template>
  <form @submit="onSubmit" class="form-control add-form p-3 border-0">
    <div class="mb-3">
      <input type="text" v-model="project_name" name="name" placeholder="Project name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
  </form>
</template>

<script>
  export default {
    name: 'AddProject',
    data() {
      return {
        project_name: '',
      }
    },
    methods: {
      onSubmit(e) {
        e.preventDefault()
        if(!this.project_name) {
          alert('Please add a project')
          return
        }
        const newProject = {
          project_name: this.project_name
        }
        this.addProject(newProject)
        this.project_name = ''
        this.$emit('close-add-project')
        this.$emit('update-projects')
      },
      async addProject(newProject) {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(newProject),
        })
        const data = await res.json()
        return data
      }
    }
  }
</script>
