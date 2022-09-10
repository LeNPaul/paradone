<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
          <header class="align-items-center pb-3 mb-3 border-bottom">
            <button @click="toggleAddIntegration()" class="btn btn-link link-dark"><i class="fas fa-plus"></i></button>
          </header>
          <IntegrationAdd v-show="showAddIntegration" @close-add-integration="toggleAddIntegration"/>
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from '../components/TheSidebar'
import IntegrationAdd from '../components/IntegrationAdd'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
    IntegrationAdd
  },
  data() {
    return {
      showAddIntegration: false,
    }
  },
  methods: {
    toggleAddIntegration() {
      this.showAddIntegration = !this.showAddIntegration
    },
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
