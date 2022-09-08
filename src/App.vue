<template>
  <FisheriesMap v-show="!this.reportIsVisible && !this.error" />
  <FisheriesReport v-if="this.reportIsVisible && !this.error" />
  <div v-if="this.error" class="error">Failed to load fisheries map.</div>
</template>

<script>
import 'purecss/build/pure.css'
import FisheriesMap from './components/FisheriesMap.vue'
import FisheriesReport from './components/FisheriesReport.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    FisheriesMap,
    FisheriesReport,
  },
  computed: {
    ...mapGetters({
      reportIsVisible: 'reportIsVisible',
      error: 'error',
    }),
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');
/* The #app div lives in WordPress, not Vue, so this cannot be scoped. */
#app {
font-family: 'Raleway', sans-serif;  .error {
    position: relative;
    top: 40%;
    transform: translateY(-40%);
  }
}
</style>
