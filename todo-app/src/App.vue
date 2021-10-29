<template>
  <div class="col-lg-8 mx-auto p-3 py-md-5">
    <Header @toggle-add-task="toggleAddTask" title="Tasks" :showAddTask="showAddTask"/>
    <router-view :showAddTask="showAddTask"></router-view>
    <Footer/>
  </div>
</template>

<script>
import Header from './components/Header'
import Footer from './components/Footer'

export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      showAddTask: false
    }
  },
  methods: {
    toggleAddTask() {
      this.showAddTask = !this.showAddTask
    }
  },
}

</script>

<style>
</style>
