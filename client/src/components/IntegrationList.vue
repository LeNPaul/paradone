<template>
  <div :key="integration._id" v-for="integration in integrations">
    <IntegrationChannel :integration="integration" @update-integrations="fetchIntegrations()"/>
  </div>
</template>

<script>
import IntegrationChannel from '../components/IntegrationChannel'

  export default {
    name: 'IntegrationList',
    components: {
      IntegrationChannel
    },
    data() {
      return {
        integrations: []
      }
    },
    methods: {
      async fetchIntegrations() {
        const res = await fetch('/api/integrations', {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        })
        const data = await res.json()
        this.integrations = data
      }
    },
    async created() {
      this.fetchIntegrations()
    }
  }
</script>
