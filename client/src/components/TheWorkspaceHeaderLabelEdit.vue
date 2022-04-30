<template>
  <form @submit="onSubmit" class="form-control add-form mb-3 mt-3 p-3">
    <div class="mb-3">
      <input type="text" name="label_name" v-model="label_name" class="form-control">
    </div>
    <button type="submit" class="btn btn-dark">Save</button>
    <button @click="deleteLabel(label_name)" class="btn btn-outline-dark btn-sm float-end" type="button"><i class="fas fa-trash"></i></button>
  </form>
</template>

<script>
  export default {
    name: 'TheWorkspaceHeaderLabelEdit',
    props: {
      label: {
        type: String
      }
    },
    data() {
      return {
        label_name: ''
      }
    },
    methods: {
      async onSubmit(e) {
        e.preventDefault()
        if(!this.label_name) {
          alert('Please provide a label name')
          return
        }
        const updLabel = {
          label_name: this.label_name
        }
        const res = await fetch(`/api/labels/${this.$props.label}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'x-auth-token': localStorage.getItem('token') || ''
          },
          body: JSON.stringify(updLabel),
        })
        const data = await res.json()
        localStorage.removeItem('labels')
        this.$store.dispatch('fetchLabels')
        this.$router.push(this.label_name.toLowerCase().replace(/[^0-9a-z]/g, '_'))
        return data
      },
      async deleteLabel(label_name) {
        if(confirm('Are you sure?')) {
          const res = await fetch(`/api/labels/${label_name}`, {
            method: 'DELETE',
            headers: {
              'x-auth-token': localStorage.getItem('token') || ''
            }
          })
          if(res.status === 200) {
            this.$store.state.labels = this.$store.state.labels.filter(function(item) {
              return item.label_name !== label_name
            })
            localStorage.removeItem('labels')
            this.$store.dispatch('fetchLabels')
            this.$router.push('/')
          } else {
            alert('Error deleting task')
          }
        }
      }
    },
    created() {
      this.label_name = this.$props.label
    },
    watch: {
      label: function() {
        this.label_name = this.$props.label
      }
    }
  }
</script>
