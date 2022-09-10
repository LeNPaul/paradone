<template>
  <p class="pb-3 border-bottom">
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.source }}</button>
    <i class="fas fa-arrow-right ps-2"></i>
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.source_query }}</button>
    <i class="fas fa-arrow-right ps-2"></i>
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.destination }}</button>
    <i class="fas fa-arrow-right ps-2"></i>
    <button type="button" class="btn btn-outline-dark p-1 ms-2" disabled>{{ integration.destination_modifier }}</button>
  </p>
</template>

<script>
  export default {
    name: 'IntegrationChannel',
    props: {
      integration: {
        type: Object,
        required: true
      }
    },
  }
</script>
