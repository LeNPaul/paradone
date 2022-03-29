<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
    <div class="mb-3">
      <input type="text" name="project_name" v-model="project_name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button @click="deleteProject(project_name)" class="btn btn-outline-dark btn-sm float-end" type="button"><i class="fas fa-trash"></i></button>
  </form>
</template>

<script>
  export default {
    name: 'TheWorkspaceHeaderProjectEdit',
    props: {
      project: {
        type: String
      }
    },
    data() {
      return {
        project_name: ''
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.project_name) {
          alert('Please provide a project name')
          return
        }
        const updProject = {
          project_name: this.project_name
        }
        const res = await fetch(`/api/projects/${this.$props.project}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(updProject),
        })
        const data = await res.json()
        this.$router.push(this.project_name)
        return data
      },
      async deleteProject(project_name) {
        if(confirm('Are you sure?')) {
          const res = await fetch(`/api/projects/${project_name}`, {
            method: 'DELETE',
            headers: {
              'x-auth-token': localStorage.getItem('token') || ''
            }
          })
          if(res.status === 200) {
            this.$store.state.projects = this.$store.state.projects.filter(function(item) {
              return item.project_name !== project_name
            })
            localStorage.removeItem('projects')
            this.$store.dispatch('fetchProjects')
            this.$router.push('/')
          } else {
            alert('Error deleting task')
          }
        }
      }
    },
    created() {
      this.project_name = this.$props.project
    },
    watch: {
      project: function() {
        this.project_name = this.$props.project
      }
    }
  }
</script>
