function convertDateTime(string) {
  if(string != null) {
    var datetime = string.split('-')
    var due_datetime = new Date(datetime[0], datetime[1] - 1, datetime[2])
  } else {
    var due_datetime = null
  }
  return due_datetime
}

var app = new Vue({
  el: '#todoApp',
  data: {
    tasks: null,
    taskText: null,
    editTaskText: null,
    editTaskId: null,
    projects: null,
    projectText: null,
    selectedProject: null,
    dueDate: null
  },
  created () {
    this.loadTasks()
    this.loadProjects()
  },
  methods: {
    loadTasks: function() {
      axios
        .get('/tasks').then(response => this.tasks = response.data)
    },
    addTask: function() {
      var due_datetime = convertDateTime(this.dueDate)
      if (this.taskText != null) {
        axios
          .post('/tasks', {username: 'paul', content: this.taskText, due_datetime: due_datetime, project_id: this.selectedProject})
        this.taskText = null
        this.dueDate = null
        this.loadTasks()
      }
    },
    updateTask: function(task_id) {
      var due_datetime = convertDateTime(this.dueDate)
      axios
        .put('/tasks', {task_id: this.editTaskId, content: document.getElementById('editTaskText').textContent, project_id: this.selectedProject, due_datetime: due_datetime})
      this.editTaskText = null
      this.editTaskId = null
      this.selectedProject = null
      this.dueDate = null
      this.loadTasks()
    },
    completeTask: function(task_id) {
      axios
        .put('/tasks', {task_id: task_id, completed: true})
      this.loadTasks()
    },
    toggleTaskModal: function(content, task_id, project_id, dueDate) {
      this.editTaskText = content
      this.editTaskId = task_id
      this.selectedProject = project_id
      this.dueDate = dueDate.substring(0,10)
    },
    loadProjects: function() {
      axios
        .get('/projects').then(response => this.projects = response.data)
    },
    addProject: function() {
      if (this.projectText != null) {
        axios
          .post('/projects', {username: 'paul', project_name: this.projectText})
        this.projectText = null
      }
    }
  },
  filters: {
    formatDate: function(value) {
      if (value) {
        return value.substring(0,10)
      }
    }
  }
})
