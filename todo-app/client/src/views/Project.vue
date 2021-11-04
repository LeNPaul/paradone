<template>
  <Workspace :key="$route"/>
</template>

<script>
import Workspace from '../components/Workspace'

export default {
  name: 'Project',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    Workspace
  }
};
</script>
