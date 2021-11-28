<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
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
    name: 'EditTask',
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
    props: {
      task: {
        type: Object,
        required: true
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.content) {
          alert('Please add a task')
          return
        }
        const taskToUpdate = await this.fetchTask(this.$props.task._id)
        const updTask = {
          ...taskToUpdate,
          content: this.content,
          label: this.label,
          priority: this.priority,
          project: this.project
        }
        const res = await fetch(`/api/tasks/${this.$props.task._id}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(updTask),
        })
        const data = await res.json()
        this.$emit('update-task')
        this.$emit('close-edit-task')
        return data
      },
      async fetchTask(id) {
        const res = await fetch(`/api/tasks/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
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
      this.content = this.$props.task.content
      this.label = this.$props.task.label
      this.priority = this.$props.task.priority
      this.project = this.$props.task.project
      this.projects = await this.fetchProjects()
      this.labels = await this.fetchLabels()
    }
  }
</script>
