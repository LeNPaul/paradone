<template>
  <TheWorkspaceParadigmPomodoroTimer/>
</template>

<script>
import TheWorkspaceParadigmPomodoroTimer from '../components/TheWorkspaceParadigmPomodoroTimer'

export default {
  name: 'WorkspaceParadigmPomodoro',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheWorkspaceParadigmPomodoroTimer
  }
};
</script>
