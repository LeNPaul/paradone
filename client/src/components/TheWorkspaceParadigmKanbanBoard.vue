<template>
    <div class="row align-items-start">
      <div class="col">
        <div class="text-center pb-3 mb-3 border-bottom">To Do</div>
        <div :key="task._id" v-for="task in todoTasks">
          <WorkspaceParadigmTask
            @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
          />
        </div>
      </div>
      <div class="col">
        <div class="text-center pb-3 mb-3 border-bottom">Doing</div>
        <div :key="task._id" v-for="task in doingTasks">
          <WorkspaceParadigmTask
            @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
          />
        </div>
      </div>
      <div class="col">
        <div class="text-center pb-3 mb-3 border-bottom">Done</div>
        <div :key="task._id" v-for="task in doneTasks">
          <WorkspaceParadigmTask
            @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
          />
        </div>
      </div>
    </div>
</template>

<script>
import WorkspaceParadigmTask from './WorkspaceParadigmTask'

export default {
  name: 'TheWorkspaceParadigmKanbanBoard',
  data() {
    return {
      todoTasks: [],
      doingTasks: [],
      doneTasks: [],
      labels: []
    }
  },
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  components: {
    WorkspaceParadigmTask
  },
  emits: ['delete-task', 'update-task'],
  methods: {
    async deleteTask(id) {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      res.status === 200
        ? this.$emit('delete-task')
        : alert('Error deleting task')
    },
    async filteredTasks(labelFilter, tasks) {
      let label = this.labels.find(o => o.label_name === labelFilter)
      let filteredTasks = tasks.filter(o => o.label_ids[0] === label._id)
      return filteredTasks
    },
    async resetBoard() {
      this.labels = JSON.parse(localStorage.getItem('labels'))
      this.todoTasks = await this.filteredTasks('todo', this.$props.tasks)
      this.doingTasks = await this.filteredTasks('doing', this.$props.tasks)
      this.doneTasks = await this.filteredTasks('done', this.$props.tasks)
    }
  },
  watch: {
    tasks: function() {
      this.resetBoard()
    }
  }
}
</script>
