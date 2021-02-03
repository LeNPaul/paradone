var app = new Vue({
  el: '#todoApp',
  data: {
    tasks: null,
    taskText: null
  },
  created () {
    this.loadTasks();
  },
  methods: {
    loadTasks: function() {
      axios
        .get('/tasks').then(response =>  this.tasks = response.data);
    },
    addTask: function() {
      if (this.taskText != null) {
        axios
          .post('/tasks', {username: 'paul', content: this.taskText})
        this.taskText = null;
      }
    }
  }
})
