<template>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTask @update-task="$emit('update-task')" @delete-task="$emit('delete-task', task._id)" :task="task"/>
  </div>
</template>

<script>
import WorkspaceTask from './WorkspaceTask'

export default {
  name: 'WorkspaceTasks',
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  components: {
    WorkspaceTask,
  },
  emits: ['delete-task', 'update-task']
}
</script>
