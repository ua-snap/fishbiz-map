<template>
  <div class="report">
    <h1>{{ groupDict[selectedGroup] }} in {{ regionDict[selectedRegion] }}</h1>
    <button @click="reset">Back to map</button>
    <div id="report" v-if="filteredFisheries[selectedRegion] != undefined">
      <div
        v-for="fishery in filteredFisheries[selectedRegion][selectedGroup]"
        :key="fishery"
      >
        <h3 v-html="fishery['name']"></h3>
        <table>
          <tr>
            <td class="label">Access</td>
            <td v-html="accessDict[fishery['access']]"></td>
          </tr>
          <tr>
            <td class="label">Species</td>
            <td v-html="speciesDict[fishery['species']]"></td>
          </tr>
          <tr>
            <td class="label">Gear</td>
            <td v-html="gearDict[fishery['gear']]"></td>
          </tr>
          <tr>
            <td class="label">Region</td>
            <td v-html="joined(fishery['region'], regionDict)"></td>
          </tr>
          <tr>
            <td class="label">CFEC code</td>
            <td v-html="fishery['code']"></td>
          </tr>
          <tr>
            <td class="label">Seasons</td>
            <td v-html="joined(fishery['seasons'], seasonDict)"></td>
          </tr>
          <tr>
            <td class="label">Link</td>
            <td>
              <a :href="fishery['link']"
                >See more information about this fishery</a
              >
            </td>
          </tr>
        </table>
        <hr />
      </div>
    </div>
    <button @click="reset">Back to map</button>
  </div>
</template>

<style lang="scss" scoped>
.report {
  margin: 0 2rem;
  text-align: left;
}
button {
  margin-bottom: 1rem;
}
h1,
h3 {
  text-align: left;
}
hr {
  margin: 2rem 0;
}
td {
  text-align: left;
}
.label {
  width: 150px;
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
  },
}
</script>
