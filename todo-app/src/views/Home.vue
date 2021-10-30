<template>
  <Workspace :key="$route"/>
</template>

<script>
import Workspace from '../components/Workspace'

export default {
  name: 'Home',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    Workspace
  }
};
</script>
