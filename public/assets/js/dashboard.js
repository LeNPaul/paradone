var app = new Vue({
  el: '#todoApp',
  data: {
    tasks: null
  },
  created () {
    this.loadTasks();
  },
  methods: {
    loadTasks: function() {
      axios
        .get('/tasks').then(response =>  this.tasks = response.data);
    }
  }
})
