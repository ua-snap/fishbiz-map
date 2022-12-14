<template>
  <div class="report">
    <h1>{{ groupDict[selectedGroup] }} in {{ regionDict[selectedRegion] }}</h1>
    <p
      class="subtitle"
      v-if="subtitle(selectedGroup)"
      v-html="subtitle(selectedGroup)"
    />
    <BackButton />
    <div id="report" v-if="filteredFisheries[selectedRegion] != undefined">
      <div v-for="fishery in orderedResults()" :key="fishery">
        <h3 v-html="fishery['name']"></h3>
        <table class="pure-table pure-table-horizontal">
          <tbody>
            <tr v-if="fishery['access']">
              <th scope="row">Access</th>
              <td v-html="accessDict[fishery['access']]"></td>
            </tr>
            <tr v-if="fishery['species']">
              <th scope="row">Species</th>
              <td v-html="speciesDict[fishery['species']]"></td>
            </tr>
            <tr v-if="fishery['gear']">
              <th scope="row">Gear</th>
              <td v-html="gearDict[fishery['gear']]"></td>
            </tr>
            <tr
              v-if="
                fishery['region'] && Object.keys(fishery['region']).length > 0
              "
            >
              <th scope="row">Region</th>
              <td v-html="joined(fishery['region'], regionDict)"></td>
            </tr>
            <tr v-if="fishery['code']">
              <th scope="row">CFEC code</th>
              <td v-html="fishery['code']"></td>
            </tr>
            <tr
              v-if="
                fishery['seasons'] && Object.keys(fishery['seasons']).length > 0
              "
            >
              <th scope="row">Seasons</th>
              <td v-html="joined(fishery['seasons'], seasonDict)"></td>
            </tr>
            <tr v-if="fishery['link']">
              <th scope="row">Link</th>
              <td>
                <a :href="fishery['link']"
                  >See more information about this fishery</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <BackButton />
  </div>
</template>

<style lang="scss" scoped>
.report {
  margin: 0 2rem 2rem;
  text-align: left;
  max-height: 100%;
  overflow-y: auto;
  font-size: 16px;
  /* Corresponds to Pure CSS' "md" min breakpoint. */
  @media (min-width: 48em) {
    flex-basis: 50%;
  }
  h1,
  h3 {
    font-family: 'Raleway', sans-serif;
  }
  .subtitle {
    margin-bottom: 1.5rem;
  }
  table {
    margin: -0.5rem 0 2rem;
  }
}
</style>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import BackButton from './BackButton.vue'

export default {
  name: 'FisheriesReport',
  components: {
    BackButton,
  },
  computed: {
    ...mapGetters({
      groupSubtitles: 'groupSubtitles',
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
    subtitle: function (group) {
      if (_.has(this.groupSubtitles, group)) {
        return this.groupSubtitles[group]
      }
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
