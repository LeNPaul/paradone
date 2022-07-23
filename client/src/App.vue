<template>
  <div class="container-fluid">
    <router-view></router-view>
  </div>

</template>

<script>

export default {
  name: 'App',
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
      console.log('isLoggedIn')
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
