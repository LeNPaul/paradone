<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <form>
          <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email address</label>
            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
          </div>
          <div class="mb-3">
            <label for="exampleInputPassword1" class="form-label">Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1">
          </div>
          <div class="mb-3">
            <router-link to="/resetpassword" class="text-dark text-decoration-none"><i class="fas fa-lock me-2"></i>Reset Password</router-link>
          </div>
          <button type="submit" class="btn btn-dark">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from '../components/TheSidebar'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
  },
  watch:{
    $route (){
      if(this.$store.getters.isLoggedIn) {
        console.log('isLoggedIn')
      }
    }
  }
}
</script>
