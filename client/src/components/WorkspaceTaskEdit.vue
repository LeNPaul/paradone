<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="title" name="title" placeholder="Title" class="form-control border-0 shadow-none">
      <textarea type="text" v-model="content" name="content" placeholder="Content" class="form-control border-0 shadow-none" rows="3"></textarea>
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button :key='task.title' v-for="task in parentTasks" type="button" class="btn btn-outline-dark p-1 ms-2 px-2" @click="this.parentTasks=this.parentTasks.filter(parentTask=>parentTask._id!=task._id)">{{ task.title }}</button>
    <button class="btn btn-outline-dark btn-sm float-end" type="button" data-bs-toggle="dropdown"><i class="fas fa-list"></i></button>
    <ul v-show="(this.parentTasks.length+1) !== this.$props.tasks.length" class="dropdown-menu">
      <li :key='task.title' v-for="task in tasks" 
        v-show="!this.parentTasks.some(parentTask=>parentTask._id==task._id) && this.task._id!==task._id"
        @click="this.parentTasks.push({_id: task._id, title: task.title})">
        <a class="dropdown-item">{{ task.title }}</a>
      </li>
    </ul>
  </form>
</template>
// TODO: refactor so that add and edit components use the same code

<script>
  const requests = require('../assets/js/requests')

  export default {
    name: 'WorkspaceTaskEdit',
    data() {
      return {
        title: '',
        content: '',
        parentTasks: []
      }
    },
    props: {
      task: {
        type: Object,
        required: true
      },
      tasks: {
        type: Array,
        required: true
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.title) {
          alert('Please add a task')
          return
        }
        const taskToUpdate = await requests.fetchTask(this.$props.task._id)
        const updTask = {
          ...taskToUpdate,
          title: this.title,
          content: this.content,
          parent_ids: this.parentTasks.map(task=>task._id)
        }
        requests.updateTask(this.$props.task._id, updTask)
        this.$emit('update-task')
        this.$emit('close-edit-task')
      }
    },
    async created() {
      this.title = this.$props.task.title
      this.content = this.$props.task.content
      this.parentTasks = await Promise.all(this.$props.task.parent_ids.map(async(parentId)=>{
        return await requests.fetchTask(parentId)
      }))
    }
  }
</script>
