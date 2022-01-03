<template>
    <div class="row align-items-start">
      <div class="col">
        <div class="text-center pb-3 mb-3 border-bottom">To Do</div>
        <div :key="task._id" v-for="task in todoTasks">
          <WorkspaceParadigmKanbanCard
            @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
          />
        </div>
      </div>
      <div class="col">
        <div class="text-center pb-3 mb-3 border-bottom">Doing</div>
        <div :key="task._id" v-for="task in doingTasks">
          <WorkspaceParadigmKanbanCard
            @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
          />
        </div>
      </div>
      <div class="col">
        <div class="text-center pb-3 mb-3 border-bottom">Done</div>
        <div :key="task._id" v-for="task in doneTasks">
          <WorkspaceParadigmKanbanCard
            @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
          />
        </div>
      </div>
    </div>
</template>

<script>
import WorkspaceParadigmKanbanCard from './WorkspaceParadigmKanbanCard'

export default {
  name: 'WorkspaceParadigmKanbanBoard',
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
    WorkspaceParadigmKanbanCard
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
    async fetchLabels() {
      const res = await fetch('/api/labels', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      return data
    },
    async filteredTasks(labelFilter, tasks) {
      let label = this.labels.find(o => o.label_name === labelFilter)
      let filteredTasks = tasks.filter(o => o.label_ids[0] === label._id)
      return filteredTasks
    },
    async resetBoard() {
      this.labels = await this.fetchLabels()
      this.todoTasks = await this.filteredTasks('To Do', this.$props.tasks)
      this.doingTasks = await this.filteredTasks('Doing', this.$props.tasks)
      this.doneTasks = await this.filteredTasks('Done', this.$props.tasks)
    }
  },
  watch: {
    tasks: function() {
      this.resetBoard()
    }
  }
}
</script>
