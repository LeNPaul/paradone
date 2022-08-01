<template>
  <div class="row">
    <div class="col-2 position-fixed border-end shadow">
      <TheSidebar :key="$route"/>
    </div>
    <div class="col-6 offset-4 pt-3 mt-3">
      <div class="mx-auto py-md-5">
        <form @submit="onSubmit">
          <div class="mb-3">
            <h3>Settings</h3>
          </div>
          <div class="mb-3">
            <label class="form-label">Todoist API Token</label>
            <input v-model="todoistToken" type="password" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Notion API Token</label>
            <input v-model="notionToken" type="password" class="form-control">
          </div>
          <div class="mb-3">
            <router-link to="/resetpassword" class="text-dark text-decoration-none"><i class="fas fa-lock me-2"></i>Reset Password</router-link>
          </div>
          <button type="submit" class="btn btn-dark">Save</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import TheSidebar from '../components/TheSidebar'

export default {
  name: 'Workspace',
  inheritAttrs: false, // disable 'non-props' warning
  components: {
    TheSidebar,
  },
  data() {
    return {
      notionToken: '',
      todoistToken: '',
    }
  },
  methods: {
    async onSubmit(e) {
      e.preventDefault()
      const settings = {
        notion_api_token: this.notionToken,
        todoist_api_token: this.todoistToken
      }
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: JSON.stringify(settings),
      })
      // TODO: Add error handling here
      alert('Settings successfully saved')
      return await res.json()
    },
    async getSettings() {
      const res = await fetch('/api/settings', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      let settings = await res.json()
      this.notionToken = settings[0].notion_api_token
      this.todoistToken = settings[0].todoist_api_token
    }
  },
  async created() {
    this.getSettings()
  }
}
</script>
