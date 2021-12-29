<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="content" name="content" placeholder="Task content" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button class="btn btn-outline-dark btn-sm float-end" type="button" data-bs-toggle="dropdown"><i class="fas fa-tags"></i> {{ label }} </button>
    <ul class="dropdown-menu">
        <li :key='label.label_id' v-for="label in labels" @click="this.label=label.name"><a class="dropdown-item">{{ label.name }}</a></li>
    </ul>
    <button class="btn btn-outline-dark btn-sm float-end me-2" type="button" data-bs-toggle="dropdown"><i class="far fa-flag"> </i> {{ priority }} </button>
    <ul class="dropdown-menu">
        <li><a class="dropdown-item" @click="this.priority='1'">Priority 1</a></li>
        <li><a class="dropdown-item" @click="this.priority='2'">Priority 2</a></li>
        <li><a class="dropdown-item" @click="this.priority='3'">Priority 3</a></li>
        <li><a class="dropdown-item" @click="this.priority='4'">Priority 4</a></li>
    </ul>
    <button class="btn btn-outline-dark btn-sm float-end me-2" type="button" data-bs-toggle="dropdown"><i class="fas fa-tasks"> </i> {{ project_name }} </button>
    <ul class="dropdown-menu">
        <li :key='project.project_name' v-for="project in projects" @click="this.project_name=project.project_name"><a class="dropdown-item">{{ project.project_name }}</a></li>
    </ul>
  </form>
</template>

<script>
  export default {
    name: 'WorkspaceHeaderTaskAdd',
    data() {
      return {
        content: '',
        label: '',
        labels: [],
        priority: '',
        project_name: '',
        projects: []
      }
    },
    emits: ['update-tasks', 'close-add-task'],
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.content) {
          alert('Please add a task')
          return
        }
        const newTask = {
          content: this.content,
          label: this.label,
          priority: this.priority,
          project_name: this.project_name
        }
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(newTask),
        })
        const data = await res.json()
        this.$emit('update-tasks')
        this.content = ''
        this.label = ''
        this.priority = ''
        this.project_name = ''
        this.$emit('close-add-task')
        return data
      },
      async fetchProjects() {
        const res = await fetch('/api/projects', {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
        return data
      },
      async fetchLabels() {
        const res = await fetch('/api/labels', {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
        return data
      }
    },
    async created() {
      this.projects = await this.fetchProjects()
      this.labels = await this.fetchLabels()
    }
  }
</script>
