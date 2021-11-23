<template>
  <PomodoroTimer/>
  <TodoWorkspace :key="$route"/>
</template>

<script>
import PomodoroTimer from '../components/PomodoroTimer'
import TodoWorkspace from '../components/TodoWorkspace'

export default {
  name: 'Pomodoro',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    PomodoroTimer,
    TodoWorkspace
  }
};
</script>
