<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
            <form @submit="onSubmit" class="form-control add-form mb-3 p-3 border-0">
                <div class="mb-3">
                <input type="text" v-model="title" name="title" placeholder="Title" class="form-control border-0 shadow-none">
                <textarea type="text" v-model="content" name="content" placeholder="Content" class="form-control border-0 shadow-none" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-dark">Save</button>
                <button type="submit" class="btn btn-outline" @click="$emit('close')">Close</button>
                <button :key='task.title' v-for="task in parentTasks" type="button" class="btn btn-outline-dark p-1 ms-2 px-2" @click="this.parentTasks=this.parentTasks.filter(parentTask=>parentTask._id!=task._id)">{{ task.title }}</button>
                <button class="btn btn-outline-dark btn-sm float-end" type="button" data-bs-toggle="dropdown"><i class="fas fa-list"></i></button>
                <ul class="dropdown-menu">
                    <li :key='task.title' v-for="task in tasks" v-show="!this.parentTasks.some(parentTask=>parentTask._id==task._id) && !task.completed" @click="this.parentTasks.push({_id: task._id, title: task.title})"><a class="dropdown-item">{{ task.title }}</a></li>
                </ul>
            </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
  const requests = require('../assets/js/requests')

  export default {
    name: 'TheWorkspaceTaskAdd',
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
    },
    show: Boolean
  },
    emits: ['update-tasks', 'close'],
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
        await requests.createTask(newTask)
        this.$emit('update-tasks')
        this.$emit('close')
        this.title = null
        this.content = null
        this.parentTasks = []
      }
    }
  }
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 800px;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>