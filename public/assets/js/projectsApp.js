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
    priority: null,
    label_ids: null,
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
    addTask: function() {
      var due_datetime = convertDateTime(this.dueDate)
      if (this.taskText != null) {
        axios
          .post('/tasks', {
            content: this.taskText,
            due_datetime: due_datetime,
            project_id: this.selectedProject,
            priority: this.priority,
            label_ids: [this.label_ids]
          })
        this.taskText = null
        this.priority = null
        // this.dueDate = null
        this.selectedProject = null
        this.projectText = null
        this.loadProjectTasks()
      } else {
        this.priority = null
        // this.dueDate = null
        this.selectedProject = null
        this.projectText = null
      }
    },
    toggleTaskModal: function(content, task_id, project_id, dueDate, priority, label_ids) {
      this.editTaskText = content
      this.editTaskId = task_id
      this.priority = priority
      this.selectedProject = project_id
      this.label_ids = label_ids
      axios.get('/projects').then(projects => {
        for (var i = 0; i < projects.data.length; i++) {
          if (project_id == projects.data[i].project_id) {
            this.projectText = projects.data[i].project_name
          }
        }
      })
      // this.dueDate = dueDate.substring(0,10)
    },
    loadProjects: function() {
      axios
        .get('/projects').then(response => this.projects = response.data)
    },
    updateTask: function(task_id) {
      var due_datetime = convertDateTime(this.dueDate)
      axios
        .put('/tasks', {
          task_id: this.editTaskId,
          content: document.getElementById('editTaskText').value,
          project_id: this.selectedProject,
          due_datetime: due_datetime,
          priority: this.priority,
          label_ids: this.label_ids
        })
      this.editTaskText = null
      this.editTaskId = null
      this.priority = null
      this.selectedProject = null
      this.projectText = null
      // this.dueDate = null
      this.loadProjectTasks()
    },
    setPriority: function(priority) {
      this.priority = priority
    },
    setProject: function(project, project_id) {
      this.projectText = project
      this.selectedProject = project_id
    },
    setLabel: function(label_ids) {
      this.label_ids = label_ids
    },
    addProject: function() {
      if (this.projectText != null) {
        axios
          .post('/projects', {project_name: this.projectText})
        this.projectText = null
        location.reload();
      }
    },
    updateProject: function() {
      axios
        .put('/projects', {
          project_id: this.selectedProject,
          project_name: this.projectText
        })
      window.location.href = '/projects/' + this.projectText
      this.loadProjectTasks()
    },
    deleteProject: function(is_archived) {
      console.log(is_archived, this.selectedProject);
      axios
        .put('/projects', {
          project_id: this.selectedProject,
          archived: is_archived
        })
      window.location.href = '/'
      this.loadProjectTasks()
    },
    reloadPage: function() {
      location.reload();
    },
    loadProjectTasks: function() {
      var url = window.location.href.split('/projects/')
      this.projectTasks = []
      var project_id
      axios.get('/projects').then(projects => {
        for (var i = 0; i < projects.data.length; i++) {
          if (url[1] == projects.data[i].project_name.toLowerCase()) {
            project_id = projects.data[i].project_id
            this.projectText = projects.data[i].project_name
            this.selectedProject = projects.data[i].project_id
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
