<template>
  <Workspace v-if="isLoggedIn" :key="$route"/>
  <AppHome v-else/>
</template>

<script>
import AppHome from '../components/AppHome'
import Workspace from '../components/Workspace'

export default {
  name: 'Main',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    AppHome,
    Workspace
  },
  props: {
    isLoggedIn: {
      type: Boolean,
      required: true
    }
  }
};
</script>
