<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <Todoist/>
        <Notion/>
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from '../components/TheSidebar'
import Todoist from '../components/Todoist'
import Notion from '../components/Notion'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
    Todoist,
    Notion
  },
  data() {
    return {

    }
  },
  methods: {

  },
  async created() {

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
