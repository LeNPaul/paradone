<template>
  <PomodoroTimer/>
  <Workspace :key="$route"/>
</template>

<script>
import PomodoroTimer from '../components/PomodoroTimer'
import Workspace from '../components/Workspace'

export default {
  name: 'Home',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    PomodoroTimer,
    Workspace
  }
};
</script>
