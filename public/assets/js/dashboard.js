var app = new Vue({
  el: '#todoApp',
  data: {
    tasks: null,
    taskText: null,
    editTaskText: null,
    editTaskId: null,
    projectText: null
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
        .put('/tasks', {task_id: this.editTaskId, content: document.getElementById('editTaskText').textContent})
      this.editTaskText = null
      this.editTaskId = null
      this.loadTasks()
    },
    completeTask: function(task_id) {
      axios
        .put('/tasks', {task_id: task_id, completed: true})
      this.loadTasks()
    },
    toggleTaskModal: function(content, task_id) {
      this.editTaskText = content
      this.editTaskId = task_id
    },
    addProject: function() {
      if (this.projectText != null) {
        axios
          .post('/projects', {project_name: this.projectText})
        this.projectText = null
      }
    }
  }
})
