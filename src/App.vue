<template>
  <FisheriesMap v-show="!this.error" />
  <FisheriesReport v-if="this.reportIsVisible && !this.error" />
  <div v-if="this.error" class="error">Failed to load fisheries map.</div>
</template>

<script>
import 'purecss/build/pure.css'
import 'purecss/build/grids-responsive.css'
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
#fishbiz-map {
  font-family: 'Raleway', sans-serif;
  @media (min-width: 1000px) {
    display: flex;
  }
  .error {
    position: relative;
    top: 40%;
    transform: translateY(-40%);
  }
}
</style>
