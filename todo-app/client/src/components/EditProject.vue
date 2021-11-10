<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
    <div class="mb-3">
      <input type="text" name="name" v-model="name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button @click="deleteProject(name)" class="btn btn-outline-dark btn-sm float-end" type="button"><i class="fas fa-trash"></i></button>
  </form>
</template>

<script>
  export default {
    name: 'EditProject',
    props: {
      project: String
    },
    data() {
      return {
        name: ''
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.name) {
          alert('Please add a project')
          return
        }
        const updProject = {
          name: this.name
        }
        const res = await fetch(`/api/projects/${this.$props.project}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(updProject),
        })
        const data = await res.json()
        this.$router.push(this.name)
        return data
      },
      async deleteProject(id) {
        if(confirm('Are you sure?')) {
          const res = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
          })
          res.status === 200
            ? this.$router.push('/')
            : alert('Error deleting task')
        }
      }
    },
    created() {
      this.name = this.$props.project
    }
  }
</script>
