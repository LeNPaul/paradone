<template>
  <AppSidebar v-if="isLoggedIn" :key="$route"/>
  <div class="container-fluid">
      <div class="row">
          <div class="col min-vh-100 p-4">
              <!-- toggler -->
              <button v-if="isLoggedIn" class="btn float-left" data-bs-toggle="offcanvas" data-bs-target="#offcanvas" role="button">
                  <i class="fas fa-bars" data-bs-toggle="offcanvas" data-bs-target="#offcanvas"></i>
              </button>
              <div class="col-lg-6 mx-auto p-3 py-md-5">
                <router-view></router-view>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import AppSidebar from './components/AppSidebar'

export default {
  name: 'App',
  components: {
    AppSidebar,
  },
  data() {
    return {
      isLoggedIn: false
    }
  },
  mounted() {
    setInterval(() => {
      this.isLoggedIn = this.$store.getters.isLoggedIn
      if(this.$route.path == '/' || this.$route.path == '/login' || this.$route.path == '/register') {
        return
      }
      if(!this.isLoggedIn) {
        this.$router.push('/')
      }
    }, 1000)
  },
  watch:{
    $route (){
      this.isLoggedIn = this.$store.getters.isLoggedIn
    }
  }
}

</script>

<style>
</style>
