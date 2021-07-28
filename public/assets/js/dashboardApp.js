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
    projectTasks: [],
    tasks: null,
    taskText: null,
    editTaskText: null,
    editTaskId: null,
    priority: null,
    label_ids: null,
    projects: null,
    projectText: null,
    editProjectText: null,
    selectedProject: null,
    dueDate: null,
    // Pomodoro
    timer: null,
    totalTime: (25 * 60),
    resetButton: false
  },
  created () {
    this.loadTasks()
    this.loadProjects()
  },
  methods: {
    loadTasks: function() {
      var url = window.location.href.split('/projects/')
      if(url.length == 1) {
        axios
          .get('/tasks').then(response => this.tasks = response.data)
      } else if (url.length == 2) {
        var project_id
        axios.get('/projects').then(projects => {
          for (var i = 0; i < projects.data.length; i++) {
            if (url[1] == projects.data[i].project_name.toLowerCase()) {
              project_id = projects.data[i].project_id
              this.editProjectText = projects.data[i].project_name
              this.selectedProject = projects.data[i].project_id
            }
          }
          axios.get('/tasks').then(tasks => {
            this.projectTasks = []
            for (var j = 0; j < tasks.data.length; j++) {
              if (tasks.data[j].project_id == project_id) {
                this.projectTasks.push(tasks.data[j])
              }
            }
          })
        })
      }
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
        this.label_ids = null
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
      this.label_ids = label_ids
    },
    loadProjects: function() {
      axios
        .get('/projects').then(response => this.projects = response.data)
    },
    updateProject: function() {
      axios
        .put('/projects', {
          project_id: this.selectedProject,
          project_name: this.editProjectText
        })
      window.location.href = '/projects/' + this.editProjectText
    },
    deleteProject: function(is_archived) {
      console.log(is_archived, this.selectedProject);
      axios
        .put('/projects', {
          project_id: this.selectedProject,
          archived: is_archived
        })
      window.location.href = '/'
    },
    reloadPage: function() {
      location.reload();
    },
    // Pomodoro
    startTimer: function() {
      this.timer = setInterval(() => this.countdown(), 1000);
      this.resetButton = true;
    },
    stopTimer: function() {
      clearInterval(this.timer);
      this.timer = null;
      this.resetButton = true;
    },
    resetTimer: function() {
      this.totalTime = (25 * 60);
      clearInterval(this.timer);
      this.timer = null;
      this.resetButton = false;
    },
    padTime: function(time) {
      return (time < 10 ? '0' : '') + time;
    },
    countdown: function() {
      if(this.totalTime >= 1){
        this.totalTime--;
      } else{
        this.totalTime = 0;
        this.resetTimer()
      }
    }
  },
  computed: {
    minutes: function() {
      const minutes = Math.floor(this.totalTime / 60);
      return this.padTime(minutes);
    },
    seconds: function() {
      const seconds = this.totalTime - (this.minutes * 60);
      return this.padTime(seconds);
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
