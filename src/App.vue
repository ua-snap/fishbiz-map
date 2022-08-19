<template>
  <FisheriesMap v-if="!this.reportIsVisible" />
  <FisheriesReport v-if="this.reportIsVisible" />
</template>

<script>
import FisheriesMap from './components/FisheriesMap.vue'
import FisheriesReport from './components/FisheriesReport.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    FisheriesMap,
    FisheriesReport,
  },
  created() {
    this.$store.dispatch('fetchRegions')
    this.$store.dispatch('fetchAccess')
    this.$store.dispatch('fetchSpecies')
    this.$store.dispatch('fetchGear')
    this.$store.dispatch('fetchFisheries')
  },
  computed: {
    ...mapGetters({
      reportIsVisible: 'reportIsVisible',
    }),
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 800px;
}
body {
  margin: 0;
}
.container:not(.is-max-desktop):not(.is-max-widescreen) {
  max-width: 100% !important;
  width: 100% !important;
  padding: 0;
}
</style>
