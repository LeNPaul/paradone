<template>
  <button @click="onClick()" class="btn btn-link link-dark"><i class="fas fa-plus"></i></button>
</template>

<script>
export default {
  name: 'ToggleButton',
  methods: {
    onClick() {
      this.$emit('btn-click')
    }
  }
}
</script>
