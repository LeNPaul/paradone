<template>
  <aside>
    <div class="d-flex flex-column flex-shrink-0 p-3 bg-white" style="width: 280px;">
      <router-link to="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
        <i class="fas fa-home fs-5 me-1"></i>
      </router-link>
      <hr>
      <ul class="nav nav-pills flex-column mb-auto">

      </ul>
      <hr>
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
          <i width="32" height="32" class="far fa-user me-2"></i>
          <strong>{{ username }}</strong>
        </a>
        <ul class="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
          <li><router-link to="/resetpassword" class="dropdown-item"><i class="fas fa-cog me-2"></i>Reset Password</router-link></li>
          <li><hr class="dropdown-divider"></li>
          <li><router-link to="/" @click="logout" class="dropdown-item" href="#"><i class="fas fa-sign-out-alt me-2"></i>Sign out</router-link></li>
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

export default {
  name: 'TheSidebar',
  components: {
  },
  data() {
    return {
      username: ''
    }
  },
  methods: {
    logout: function () {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  },
  async created() {
    let user = JSON.parse(localStorage.getItem('user') || '')
    this.username = user.username
  },
  watch: {

  }
}
</script>
