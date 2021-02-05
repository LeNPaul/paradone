var app = new Vue({
  el: '#todoApp',
  data: {
    tasks: null,
    taskText: null
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
    completeTask: function() {
      axios
        .put('/tasks', {username: 'paul', task_id:'ecf9af29-5ca5-473d-ae0b-599fcd2f18df', completed: true})
    }
  }
})
