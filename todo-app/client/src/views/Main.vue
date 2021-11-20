<template>
  <Workspace v-if="this.$store.getters.isLoggedIn" :key="$route"/>
</template>

<script>
import Workspace from '../components/Workspace'

export default {
  name: 'Main',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    Workspace
  }
};
</script>
