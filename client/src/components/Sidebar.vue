<template>
  <div>
    <div class="col-lg-3 p-3 py-md-5" id="sidebarApp">
      <div class="p-3 bg-white" style="width: 280px;"><a class="d-flex align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom" href="/">
          <svg class="bi me-2" width="30" height="24">
            <use xlink:href="#bootstrap"></use>
          </svg><span class="fs-5 fw-semibold">paradone</span></a>
        <ul class="list-unstyled ps-0">
          <li class="mb-1">
            <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#home-collapse" aria-expanded="false">Dashboard</button>
            <div class="collapse" id="home-collapse">
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                <li><a class="link-dark rounded" href="/">Home</a></li>
              </ul>
            </div>
          </li>
          <li class="mb-1">
            <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#projects-collapse" aria-expanded="false">Projects</button>
            <div class="collapse" id="projects-collapse">
              <!--<ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small" v-for="project in projects">
                <li><a class="link-dark rounded" v-if="!project.archived" v-bind:href="'/projects/' + project.project_name | lowercase">{{ project.project_name }}</a></li>
              </ul>
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                <li><a data-bs-toggle="modal" data-bs-target="#addProjectModal"><i class="fas fa-plus"></i></a></li>
              </ul>-->
            </div>
          </li>
          <li class="mb-1">
            <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#paradigms-collapse" aria-expanded="false">Paradigms</button>
            <div class="collapse" id="paradigms-collapse">
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                <li><a class="link-dark rounded" href="/paradigms/eisenhower">Eisenhower Matrix</a></li>
              </ul>
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                <li><a class="link-dark rounded" href="/paradigms/kanban">Kanban</a></li>
              </ul>
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                <li><a class="link-dark rounded" href="/paradigms/pomodoro">Pomodoro</a></li>
              </ul>
            </div>
          </li>
          <li class="border-top my-3"></li>
          <li class="mb-1">
            <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#account-collapse" aria-expanded="false">Account</button>
            <div class="collapse" id="account-collapse">
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                <li><a class="link-dark rounded" href="/logout">Logout</a></li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
