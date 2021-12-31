<template>
  <WorkspaceParadigmPomodoroTimer/>
</template>

<script>
import WorkspaceParadigmPomodoroTimer from '../components/WorkspaceParadigmPomodoroTimer'

export default {
  name: 'Pomodoro',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    WorkspaceParadigmPomodoroTimer
  }
};
</script>
