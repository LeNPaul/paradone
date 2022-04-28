<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-2 position-fixed border-end shadow">
        <TheSidebar v-if="isLoggedIn" :key="$route"/>
      </div>
      <div class="col-6 offset-4 pt-3 mt-3">
        <div class="mx-auto py-md-5">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import TheSidebar from './components/TheSidebar'

export default {
  name: 'App',
  components: {
    TheSidebar,
  },
  data() {
    return {
      isLoggedIn: false
    }
  },
  mounted() {
    setInterval(() => {
      this.isLoggedIn = this.$store.getters.isLoggedIn
      if(!this.isLoggedIn && (this.$route.path != '/login' && this.$route.path != '/register')) {
        this.$store.dispatch('logout')
        this.$router.push('/login')
      }
    }, 1000)
  },
  async created() {
    this.isLoggedIn = this.$store.getters.isLoggedIn
    if(this.isLoggedIn) {
      this.$store.dispatch('fetchLabels')
      this.$store.dispatch('fetchProjects')
    }
  },
  watch:{
    $route (){
      this.isLoggedIn = this.$store.getters.isLoggedIn
      if(this.isLoggedIn && (this.$route.path == '/login' || this.$route.path == '/register')) {
        this.$router.push('/')
      }
    }
  }
}
</script>
