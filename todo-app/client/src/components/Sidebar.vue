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
          <router-link class="nav-link text-truncate link-dark" to="/"><i class="fas fa-home fs-5"></i><span class="ms-1 d-none d-sm-inline">Home</span></router-link>
        </li>
      </ul>
      <hr>
      <button @click="toggleAddProject" class="btn btn-link link-dark text-decoration-none"><span class="fs-6 me-2">Projects</span><i class="fas fa-plus"></i></button>
      <AddProject v-show="showAddProject" @close-add-project="toggleAddProject" @update-projects="updateProjects"/>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li :key='project.name' v-for="project in projects" class="nav-item">
          <router-link :to="{ name: 'Project', params: { project: project.name } }" class="nav-link text-truncate link-dark"><i class="fas fa-arrow-right"></i><span class="ms-1 d-none d-sm-inline">{{ project.name }}</span></router-link>
        </li>
      </ul>
      <hr>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/paradigm/eisenhower"><i class="fas fa-th-large"></i><span class="ms-1 d-none d-sm-inline">Eisenhower Matrix</span></router-link>
        </li>
      </ul>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/paradigm/kanban"><i class="fas fa-columns"></i><span class="ms-1 d-none d-sm-inline">Kanban</span></router-link>
        </li>
      </ul>
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
        <li class="nav-item">
          <router-link class="nav-link text-truncate link-dark" to="/paradigm/pomodoro"><i class="fas fa-clock"></i><span class="ms-1 d-none d-sm-inline">Pomodoro</span></router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AddProject from '../components/AddProject'

export default {
  name: 'Sidebar',
  components: {
    AddProject
  },
  data() {
    return {
      showAddProject: false,
      projects: []
    }
  },
  methods: {
    async fetchProjects() {
      const res = await fetch('/api/projects')
      const data = await res.json()
      return data
    },
    toggleAddProject() {
      this.showAddProject = !this.showAddProject
    },
    async updateProjects() {
      this.projects = await this.fetchProjects()
    }
  },
  async created() {
    this.projects = await this.fetchProjects()
  }
}
</script>
