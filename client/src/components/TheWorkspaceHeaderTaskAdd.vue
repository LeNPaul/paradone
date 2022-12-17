<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 p-3">
    <div class="mb-3">
      <input type="text" v-model="title" name="title" placeholder="Title" class="form-control border-0 shadow-none">
      <textarea type="text" v-model="content" name="content" placeholder="Content" class="form-control border-0 shadow-none" rows="3"></textarea>
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button :key='task.title' v-for="task in parentTasks" type="button" class="btn btn-outline-dark p-1 ms-2 px-2" @click="this.parentTasks=this.parentTasks.filter(parentTask=>parentTask._id!=task._id)">{{ task.title }}</button>
    <button class="btn btn-outline-dark btn-sm float-end" type="button" data-bs-toggle="dropdown"><i class="fas fa-list"></i></button>
    <ul class="dropdown-menu">
        <li :key='task.title' v-for="task in tasks" v-show="!this.parentTasks.some(parentTask=>parentTask._id==task._id)" @click="this.parentTasks.push({_id: task._id, title: task.title})"><a class="dropdown-item">{{ task.title }}</a></li>
    </ul>
  </form>
</template>

<script>
  export default {
    name: 'TheWorkspaceHeaderTaskAdd',
    data() {
      return {
        title: null,
        content: null,
        parentTasks: []
      }
    },
    props: {
    tasks: {
      type: Array,
      required: true
    }
  },
    emits: ['update-tasks', 'close-add-task'],
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.title) {
          alert('Please add a task')
          return
        }
        const newTask = {
          title: this.title,
          content: this.content,
          parent_ids: this.parentTasks.map((task)=>task._id)
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
        this.title = null
        this.content = null
        this.parentTasks = []
        return data
      }
    }
  }
</script>
