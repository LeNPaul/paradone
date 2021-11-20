<template>
  <Workspace v-if="this.$store.getters.isLoggedIn" :key="$route"/>
  <Home v-else/>
</template>

<script>
import Home from '../components/Home'
import Workspace from '../components/Workspace'

export default {
  name: 'Main',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    Home,
    Workspace
  }
};
</script>
