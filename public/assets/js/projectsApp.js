var app = new Vue({
  el: '#projectApp',
  data: {
    tasks: []
  },
  created () {
    this.loadProjects()
  },
  methods: {
    loadProjects: function() {
      var url = window.location.href.split('/projects/')
      var tasks = []
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
              this.tasks.push(tasks.data[j])
            }
          }
        })
      })
    }
  }
})
