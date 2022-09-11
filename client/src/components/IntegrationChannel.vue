<template>
  <p class="pb-3 border-bottom">
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.source }}</button>
    <i class="fas fa-arrow-right ps-2"></i>
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.source_query }}</button>
    <i class="fas fa-arrow-right ps-2"></i>
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.destination }}</button>
    <i class="fas fa-arrow-right ps-2"></i>
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.destination_modifier }}</button>
    <button class="btn btn-link link-dark float-end" type="submit"><i @click="toggleEditIntegration()" class="fas fa-edit"></i></button>
    <IntegrationEdit v-show="showEditIntegration" :integration="integration" class="mt-3"/>
  </p>
</template>

<script>
import IntegrationEdit from '../components/IntegrationEdit'

  export default {
    name: 'IntegrationChannel',
    data() {
      return {
        showEditIntegration: false,
      }
    },
    components: {
      IntegrationEdit
    },
    props: {
      integration: {
        type: Object,
        required: true
      }
    },
    methods: {
      toggleEditIntegration() {
        this.showEditIntegration = !this.showEditIntegration
      }
    }
  }
</script>
