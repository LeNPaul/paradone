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
    priority: null,
    label_ids: null,
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
        this.loadTasks()
      } else {
        this.priority = null
        // this.dueDate = null
        this.selectedProject = null
        this.projectText = null
      }
    },
    addProject: function() {
      if (this.projectText != null) {
        axios
          .post('/projects', {project_name: this.projectText})
        this.projectText = null
        location.reload();
      }
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
      this.loadTasks()
    },
    completeTask: function(task_id) {
      axios
        .put('/tasks', {task_id: task_id, completed: true})
      this.loadTasks()
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
    setPriority: function(priority) {
      this.priority = priority
    },
    setProject: function(project, project_id) {
      this.projectText = project
      this.selectedProject = project_id
    },
    setLabel: function(label_ids) {
      this.label_ids = [label_ids]
    },
    loadProjects: function() {
      axios
        .get('/projects').then(response => this.projects = response.data)
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
