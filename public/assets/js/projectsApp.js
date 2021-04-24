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
  el: '#projectApp',
  data: {
    projectTasks: [],
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
    this.loadProjectTasks()
    this.loadProjects()
  },
  methods: {
    completeTask: function(task_id) {
      axios
        .put('/tasks', {task_id: task_id, completed: true})
      this.loadProjectTasks()
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
    updateTask: function(task_id) {
      var due_datetime = convertDateTime(this.dueDate)
      axios
        .put('/tasks', {task_id: this.editTaskId, content: document.getElementById('editTaskText').textContent, project_id: this.selectedProject, due_datetime: due_datetime})
      this.editTaskText = null
      this.editTaskId = null
      this.selectedProject = null
      this.dueDate = null
      this.loadProjectTasks()
    },
    loadProjectTasks: function() {
      var url = window.location.href.split('/projects/')
      this.projectTasks = []
      var project_id
      axios.get('/projects').then(projects => {
        for (var i = 0; i < projects.data.length; i++) {
          if (url[1] == projects.data[i].project_name.toLowerCase()) {
            project_id = projects.data[i].project_id
          }
        }
        axios.get('/tasks').then(tasks => {
          for (var j = 0; j < tasks.data.length; j++) {
            if (tasks.data[j].project_id == project_id) {
              this.projectTasks.push(tasks.data[j])
            }
          }
        })
      })
    }
  }
})
