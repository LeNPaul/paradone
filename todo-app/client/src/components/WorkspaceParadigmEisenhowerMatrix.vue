<template>
  <div class="row align-items-start mh-100">
    <div class="col">
      <div class="text-center pb-3 mb-3 border-bottom">Urgent/Important</div>
      <div :key="task._id" v-for="task in priorityOne">
        <WorkspaceParadigmTask
          @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
        />
      </div>
    </div>
    <div class="col">
      <div class="text-center pb-3 mb-3 border-bottom">Not Urgent/Important</div>
      <div :key="task._id" v-for="task in priorityTwo">
        <WorkspaceParadigmTask
          @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
        />
      </div>
    </div>
  </div>
  <div class="row align-items-start">
    <div class="col">
      <div class="text-center pb-3 mb-3 border-bottom">Urgent/Not Important</div>
      <div :key="task._id" v-for="task in priorityThree">
        <WorkspaceParadigmTask
          @update-task="$emit('update-task')" @delete-task="deleteTask(task._id)" :task="task"
        />
      </div>
    </div>
    <div class="col">
      <div class="text-center pb-3 mb-3 border-bottom">Not Urgent/Not Important</div>
      <div :key="task._id" v-for="task in priorityFour">
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
  name: 'EisenhowerMatrix',
  data() {
    return {
      priorityOne: [],
      priorityTwo: [],
      priorityThree: [],
      priorityFour: []
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
    async filteredTasks(priority, tasks) {
      let filteredTasks = tasks.filter(o => o.priority[0] === priority)
      return filteredTasks
    },
    async resetBoard() {
      this.priorityOne = await this.filteredTasks('1', this.$props.tasks)
      this.priorityTwo = await this.filteredTasks('2', this.$props.tasks)
      this.priorityThree = await this.filteredTasks('3', this.$props.tasks)
      this.priorityFour = await this.filteredTasks('4', this.$props.tasks)
    }
  },
  watch: {
    tasks: function() {
      this.resetBoard()
    }
  }
}
</script>
