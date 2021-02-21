var app = new Vue({
  el: '#todoApp',
  data: {
    tasks: null,
    taskText: null,
    editTaskText: null
  },
  created () {
    this.loadTasks()
  },
  methods: {
    loadTasks: function() {
      axios
        .get('/tasks').then(response =>  this.tasks = response.data)
    },
    addTask: function() {
      if (this.taskText != null) {
        axios
          .post('/tasks', {username: 'paul', content: this.taskText})
        this.taskText = null
        this.loadTasks()
      }
    },
    updateTask: function(task_id) {
      axios
        .put('/tasks', {task_id: task_id, content: this.editTaskText})
      this.editTaskText = null
      this.loadTasks()
    },
    completeTask: function(task_id) {
      axios
        .put('/tasks', {task_id: task_id, completed: true})
      this.loadTasks()
    }
  }
})
