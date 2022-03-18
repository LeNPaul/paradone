<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="content" name="content" placeholder="Task content" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button class="btn btn-outline-dark btn-sm float-end" type="button" data-bs-toggle="dropdown"><i class="fas fa-tags"></i> {{ label }} </button>
    <ul class="dropdown-menu">
        <li :key='label.label_name' v-for="label in labels" @click="this.label=label.label_name, this.label_ids[0]=label._id"><a class="dropdown-item">{{ label.label_name }}</a></li>
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
        <li :key='project.project_name' v-for="project in projects" @click="this.project_id=project._id,this.project_name=project.project_name"><a class="dropdown-item">{{ project.project_name }}</a></li>
    </ul>
  </form>
</template>

<script>
  export default {
    name: 'WorkspaceTaskEdit',
    data() {
      return {
        content: '',
        label: '',
        labels: [],
        label_ids: [],
        priority: '',
        project_name: '',
        project_id: '',
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
          label_ids: this.label_ids,
          priority: this.priority,
          project_id: this.project_id
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
      async fetchLabel(id) {
        const res = await fetch(`/api/labels/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
        return data
      }
    },
    async created() {
      this.projects = JSON.parse(localStorage.getItem('projects'))
      this.labels = JSON.parse(localStorage.getItem('labels'))
      this.project_id = this.$props.task.project_id
      this.content = this.$props.task.content
      if(this.$props.task.label_ids[0]) {
        let label = await this.fetchLabel(this.$props.task.label_ids[0])
        this.label = label.label_name
        this.label_ids = this.$props.task.label_ids
      }
      this.priority = this.$props.task.priority
      let project = this.projects.find(o => o._id === this.$props.task.project_id)
      this.project_name = project ? project.project_name : ''
    }
  }
</script>
