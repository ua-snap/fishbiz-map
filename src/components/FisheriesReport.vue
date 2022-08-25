<template>
  <div class="report">
    <h1>{{ groupDict[selectedGroup] }} in {{ regionDict[selectedRegion] }}</h1>
    <button @click="reset">Back to map</button>
    <div id="report" v-if="filteredFisheries[selectedRegion] != undefined">
      <div v-for="fishery in orderedResults()" :key="fishery">
        <h3 v-html="fishery['name']"></h3>
        <table>
          <tr>
            <td>Access</td>
            <td v-html="accessDict[fishery['access']]"></td>
          </tr>
          <tr>
            <td>Species</td>
            <td v-html="speciesDict[fishery['species']]"></td>
          </tr>
          <tr>
            <td>Gear</td>
            <td v-html="gearDict[fishery['gear']]"></td>
          </tr>
          <tr>
            <td>Region</td>
            <td v-html="joined(fishery['region'], regionDict)"></td>
          </tr>
          <tr>
            <td>CFEC code</td>
            <td v-html="fishery['code']"></td>
          </tr>
          <tr>
            <td>Seasons</td>
            <td v-html="joined(fishery['seasons'], seasonDict)"></td>
          </tr>
          <tr>
            <td>Link</td>
            <td>
              <a :href="fishery['link']"
                >See more information about this fishery</a
              >
            </td>
          </tr>
        </table>
      </div>
    </div>
    <button @click="reset">Back to map</button>
  </div>
</template>

<style lang="scss" scoped>
@import '~/node_modules/picnic/picnic.min.css';
.report {
  margin: 0 2rem;
  text-align: left;
  max-height: 750px;
  overflow-y: auto;
}
button {
  margin-bottom: 1rem;
}
table {
  margin-bottom: 2rem;
}
</style>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'

export default {
  name: 'FisheriesReport',
  computed: {
    ...mapGetters({
      filteredFisheries: 'filteredFisheries',
      selectedRegion: 'selectedRegion',
      selectedGroup: 'selectedGroup',
      accessDict: 'accessDict',
      speciesDict: 'speciesDict',
      gearDict: 'gearDict',
      regionDict: 'regionDict',
      seasonDict: 'seasonDict',
      groupDict: 'groupDict',
    }),
  },
  methods: {
    reset: function () {
      this.$store.commit('closeReport')
    },
    joined: function (array, dict) {
      return _.map(array, key => dict[key]).join(', ')
    },
    orderedResults: function () {
      return _.orderBy(
        this.filteredFisheries[this.selectedRegion][this.selectedGroup],
        'name'
      )
    },
  },
}
</script>
