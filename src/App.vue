<template>
  <FisheriesMap
    v-show="!this.error"
    :class="{ 'hidden-mobile': reportIsVisible }"
  />
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
  /* Corresponds to Pure CSS' "md" min breakpoint. */
  @media (min-width: 48em) {
    display: flex;
  }
  .error {
    position: relative;
    top: 40%;
    transform: translateY(-40%);
  }
}
/* "pure-hidden-*" classes were removed from Pure CSS, so implement comparable
   classes manually. See the following for more info and width breakpoints:
   https://github.com/pure-css/pure/issues/326 */

/* Corresponds to Pure CSS' "sm" max breakpoint. */
@media (max-width: 47.938em) {
  .hidden-mobile {
    display: none;
  }
}
/* Corresponds to Pure CSS' "md" min breakpoint. */
@media (min-width: 48em) {
  .hidden-desktop {
    display: none;
  }
}
</style>
