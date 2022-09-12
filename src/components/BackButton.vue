<template>
  <button class="pure-button" @click="goBack">
    <span class="hidden-mobile">Close sidebar</span>
    <span class="hidden-desktop">Back to map</span>
  </button>
</template>

<script>
export default {
  name: 'BackButton',
  methods: {
    goBack: function () {
      this.$store.commit('closeReport')
    },
  },
}
</script>
