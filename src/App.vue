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
  created() {},
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
</style>
