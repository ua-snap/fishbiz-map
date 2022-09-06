<template>
  <FisheriesMap v-show="!this.reportIsVisible && !this.error" />
  <FisheriesReport v-if="this.reportIsVisible && !this.error" />
  <div v-if="this.error" class="error">Failed to load fisheries map.</div>
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
  mounted() {
    this.fillWidth()
    window.addEventListener('resize', this.fillWidth)
  },
  computed: {
    ...mapGetters({
      reportIsVisible: 'reportIsVisible',
      error: 'error',
    }),
  },
  methods: {
    fillWidth() {
      let windowWidth = window.innerWidth
      let scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      let containerDiv = document.querySelector('.container')
      if (containerDiv != null) {
        let containerWidth = containerDiv.offsetWidth
        let appDiv = document.getElementById('app')
        let style = window.getComputedStyle(containerDiv)
        let paddingWidth = style.paddingLeft
        containerWidth -= parseInt(paddingWidth) * 2 - scrollbarWidth
        let marginStyle
        if (windowWidth == containerWidth) {
          marginStyle = '-' + paddingWidth
        } else {
          let marginWidth = (windowWidth - containerWidth) / 2
          marginStyle = '-' + marginWidth + 'px'
        }
        appDiv.style.marginLeft = marginStyle
        appDiv.style.marginRight = marginStyle
      }
    },
  },
}
</script>

<style lang="scss">
/* The #app div lives in WordPress, not Vue, so this cannot be scoped. */
#app {
  height: 900px;
  .error {
    position: relative;
    top: 40%;
    transform: translateY(-40%);
  }
}
</style>
