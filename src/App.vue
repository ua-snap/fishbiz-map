<template>
  <FisheriesMap v-if="!this.reportIsVisible && !this.error" />
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
      let containerDiv = document.querySelector('.container')
      if (containerDiv != null) {
        let containerWidth = containerDiv.offsetWidth
        let appDiv = document.getElementById('app')
        let marginStyle
        if (windowWidth == containerWidth) {
          let style = window.getComputedStyle(containerDiv)
          let paddingWidth = style.paddingLeft
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 900px;
  .error {
    position: relative;
    top: 40%;
    transform: translateY(-40%);
  }
}
body {
  margin: 0;
}
</style>
