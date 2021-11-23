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
    <button class="btn btn-outline-dark btn-sm float-end me-2" type="button" data-bs-toggle="dropdown"><i class="fas fa-tasks"> </i> {{ project }} </button>
    <ul class="dropdown-menu">
        <li :key='project.name' v-for="project in projects" @click="this.project=project.name"><a class="dropdown-item">{{ project.name }}</a></li>
    </ul>
  </form>
</template>

<script>
  export default {
    name: 'AddTask',
    data() {
      return {
        content: '',
        label: '',
        labels: [],
        priority: '',
        project: '',
        projects: []
      }
    },
    methods: {
      onSubmit(e) {
        e.preventDefault()
        if(!this.content) {
          alert('Please add a task')
          return
        }
        const newTask = {
          content: this.content,
          label: this.label,
          priority: this.priority,
          project: this.project
        }
        this.$emit('add-task', newTask)
        this.content = ''
        this.label = ''
        this.priority = ''
        this.project = ''
        this.$emit('close-add-task')
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
