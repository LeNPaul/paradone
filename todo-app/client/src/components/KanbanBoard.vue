<template>
  <h3 class="pb-3 mb-3 border-bottom">To Do</h3>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTaskAdd v-if="task.label=='To Do'" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Doing</h3>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTaskAdd v-if="task.label=='Doing'" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
  <h3 class="pb-3 mb-3 border-bottom">Done</h3>
  <div :key="task._id" v-for="task in tasks">
    <WorkspaceTaskAdd v-if="task.label=='Done'" @delete-task="$emit('delete-task', task._id)" @update-task="$emit('update-task')" :task="task"/>
  </div>
</template>

<script>
import WorkspaceTaskAdd from './WorkspaceTaskAdd'

export default {
  name: 'KanbanBoard',
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  components: {
    WorkspaceTaskAdd,
  },
  emits: ['delete-task', 'update-task']
}
</script>
