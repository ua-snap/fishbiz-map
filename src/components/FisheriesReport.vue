<template>
  <div class="report">
    <h1>{{ groupDict[selectedGroup] }} in {{ regionDict[selectedRegion] }}</h1>
    <button @click="goBack">Back to map</button>
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
    <button @click="goBack">Back to map</button>
  </div>
</template>

<style lang="scss" scoped>
.report {
  margin: 0 2rem;
  text-align: left;
  max-height: 900px;
  overflow-y: auto;
  font-size: 1.6rem;
}
button {
  margin: 0 0 1rem 0;
  padding: 0.4em 0.8em;
  background: #0074d9;
  color: #fff;
  border: 0;
  border-radius: 0.2em;
  cursor: pointer;
  transition: all 0.3s;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-weight: 400;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;

  &:hover {
    box-shadow: inset 0 0 0 99em rgba(255, 255, 255, 0.2);
    border: 0;
  }
}
table {
  margin-bottom: 2rem;
}
tr:nth-child(even) {
  background: rgba(17, 17, 17, 0.05);
}
td {
  padding: 0.3em 2.4em 0.3em 0.6em;

  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
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
    goBack: function () {
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
