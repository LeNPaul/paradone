var app = new Vue({
  el: '#sidebarApp',
  data: {
    projects: null
  },
  created () {
    this.loadProjects()
  },
  methods: {
    loadProjects: function() {
      axios
        .get('/projects').then(response => this.projects = response.data)
    }
  },
  filters: {
    lowercase: function(value) {
      return value.toLowerCase()
    }
  }
})
