<template>
  <aside>
    <div class="d-flex flex-column flex-shrink-0 p-3 bg-white border-end" style="width: 280px;">
      <router-link to="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
        <i class="fas fa-home fs-5 me-1"></i>
      </router-link>
      <hr>
      <ul class="nav nav-pills flex-column mb-auto">

        <li class="nav-item">
          <button @click="toggleAddProject" class="btn btn-link link-dark text-decoration-none"><span class="fs-6 me-2">Projects</span><i class="fas fa-plus"></i></button>
          <TheSidebarProjectAdd v-show="showAddProject" @close-add-project="toggleAddProject" @update-projects="updateProjects"/>
        </li>

        <li :key='project.project_name' v-for="project in projects">
          <router-link :to="{ name: 'Project', params: { project: project.project_name } }" class="nav-link link-dark">
            <i class="fas fa-tasks me-1"></i>
            {{ project.project_name }}
          </router-link>
        </li>

        <li class="nav-item">
          <button @click="toggleAddLabel" class="btn btn-link link-dark text-decoration-none"><span class="fs-6 me-2">Labels</span><i class="fas fa-plus"></i></button>
          <TheSidebarLabelAdd v-show="showAddLabel" @close-add-label="toggleAddLabel" @update-labels="updateLabels"/>
        </li>

        <li :key='label.label_name' v-for="label in labels">
          <router-link :to="{ name: 'Label', params: { label: label.label_name.toLowerCase().replace(/\s/g, '') } }" class="nav-link link-dark">
            <i class="fas fa-tag me-1"></i>
            {{ label.label_name }}
          </router-link>
        </li>

      </ul>
      <hr>
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
          <i width="32" height="32" class="far fa-user me-2"></i>
          <strong>{{ username }}</strong>
        </a>
        <ul class="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
          <li><router-link to="/resetpassword" class="dropdown-item">Reset Password</router-link></li>
          <li><hr class="dropdown-divider"></li>
          <li><router-link to="/" @click="logout" class="dropdown-item" href="#">Sign out</router-link></li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<style>
aside {
  display: flex;
  flex-wrap: nowrap;
  height: 100vh;
  max-height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>

<script>
import TheSidebarProjectAdd from '../components/TheSidebarProjectAdd'
import TheSidebarLabelAdd from '../components/TheSidebarLabelAdd'


export default {
  name: 'TheSidebar',
  components: {
    TheSidebarProjectAdd,
    TheSidebarLabelAdd
  },
  data() {
    return {
      showAddProject: false,
      showAddLabel: false,
      projects: [],
      labels: [],
      username: ''
    }
  },
  methods: {
    toggleAddProject() {
      this.showAddProject = !this.showAddProject
    },
    async updateProjects(newProject) {
      this.projects.push(newProject)
    },
    toggleAddLabel() {
      this.showAddLabel = !this.showAddLabel
    },
    async updateLabels(newLabel) {
      this.labels.push(newLabel)
    },
    logout: function () {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  },
  async created() {
    this.projects = this.$store.state.projects
    this.labels = this.$store.state.labels
    let user = JSON.parse(localStorage.getItem('user') || '')
    this.username = user.username
  },
  watch: {
    '$store.state.projects': function() {
      this.projects = this.$store.state.projects
    },
    '$store.state.labels': function() {
      this.labels = this.$store.state.labels
    }
  }
}
</script>
