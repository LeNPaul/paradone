<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <IntegrationAdd/>
        <Sync/>
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from '../components/TheSidebar'
import Sync from '../components/Sync'
import IntegrationAdd from '../components/IntegrationAdd'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
    Sync,
    IntegrationAdd
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
