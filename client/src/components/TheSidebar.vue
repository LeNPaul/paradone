<!-- https://www.codeply.com/p/J7fUOhLOy9 -->
<template>
  <div class="offcanvas offcanvas-start w-25" tabindex="-1" id="offcanvas" data-bs-keyboard="false" data-bs-backdrop="false">
    <div class="offcanvas-header">
      <h6 class="offcanvas-title d-none d-sm-block" id="offcanvas">Paradone</h6>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body px-0">
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/app"><i class="fas fa-home fs-5"></i><span class="ms-1 d-none d-sm-inline">Home</span></router-link>
        </li>
      </ul>
      <hr>
      <button @click="toggleAddProject" class="btn btn-link link-dark text-decoration-none"><span class="fs-6 me-2">Projects</span><i class="fas fa-plus"></i></button>
      <TheSidebarProjectAdd v-show="showAddProject" @close-add-project="toggleAddProject" @update-projects="updateProjects"/>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li :key='project.project_name' v-for="project in projects" class="nav-item">
          <router-link :to="{ name: 'Project', params: { project: project.project_name } }" class="nav-link text-truncate link-dark"><i class="fas fa-arrow-right"></i><span class="ms-1 d-none d-sm-inline">{{ project.project_name }}</span></router-link>
        </li>
      </ul>
      <hr>
      <button @click="toggleAddLabel" class="btn btn-link link-dark text-decoration-none"><span class="fs-6 me-2">Labels</span><i class="fas fa-plus"></i></button>
      <TheSidebarLabelAdd v-show="showAddLabel" @close-add-label="toggleAddLabel" @update-labels="updateLabels"/>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li :key='label.label_name' v-for="label in labels" class="nav-item">
          <router-link :to="{ name: 'Label', params: { label: label.label_name.toLowerCase().replace(/\s/g, '') } }" class="nav-link text-truncate link-dark"><i class="fas fa-arrow-right"></i><span class="ms-1 d-none d-sm-inline">{{ label.label_name }}</span></router-link>
        </li>
      </ul>
      <hr>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/app/paradigm/eisenhower"><i class="fas fa-th-large"></i><span class="ms-1 d-none d-sm-inline">Eisenhower Matrix</span></router-link>
        </li>
      </ul>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/app/paradigm/kanban"><i class="fas fa-columns"></i><span class="ms-1 d-none d-sm-inline">Kanban</span></router-link>
        </li>
      </ul>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/app/paradigm/pomodoro"><i class="fas fa-clock"></i><span class="ms-1 d-none d-sm-inline">Pomodoro</span></router-link>
        </li>
      </ul>
      <hr>

      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <span class="nav-link text-truncate link-dark ms-1 d-none d-sm-inline text-muted">Logged in as {{ username }}</span>
        </li>
      </ul>

      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 mt-2 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/app/resetpassword"><i class="fas fa-cog"></i><span class="ms-1 d-none d-sm-inline">Reset Password</span></router-link>
        </li>
      </ul>

      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/" @click="logout"><i class="fas fa-sign-out-alt"></i><span class="ms-1 d-none d-sm-inline">Logout</span></router-link>
        </li>
      </ul>



    </div>
  </div>
</template>

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
    }
  },
  async created() {
    this.projects = this.$store.state.projects
    this.labels = this.$store.state.labels
    let user = JSON.parse(localStorage.getItem('user') || '')
    this.username = user.username
  }
}
</script>
