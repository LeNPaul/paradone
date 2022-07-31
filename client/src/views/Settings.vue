<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <form>
          <div class="mb-3">
            <label class="form-label">Todoist API Token</label>
            <input v-model="todoistToken" type="password" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Notion API Token</label>
            <input v-model="notionToken" type="password" class="form-control">
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
  data() {
    return {
      notionToken: '',
      todoistToken: '',
    }
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
