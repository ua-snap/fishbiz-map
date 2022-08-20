<template>
  <div class="report">
    <h1>{{ selectedGroup }} in {{ selectedRegion }}</h1>
    <div id="report" v-if="groupedFisheries[selectedRegion] != undefined">
      <button @click="reset">Back to map</button>
      <div
        v-for="fishery in groupedFisheries[selectedRegion][selectedGroup]"
        :key="fishery"
      >
        <h3 v-html="fishery['name']"></h3>
        <table>
          <tr>
            <td style="width: 200px">Access</td>
            <td v-html="fishery['entry']"></td>
          </tr>
          <tr>
            <td>Species</td>
            <td v-html="fishery['species']"></td>
          </tr>
          <tr>
            <td>Gear</td>
            <td v-html="fishery['gear']"></td>
          </tr>
          <tr>
            <td>Region</td>
            <td v-html="fishery['region']"></td>
          </tr>
          <tr>
            <td>CFEC code</td>
            <td v-html="fishery['code']"></td>
          </tr>
          <tr>
            <td>Seasons</td>
            <td v-html="fishery['seasons']"></td>
          </tr>
          <tr>
            <td>Link</td>
            <td>
              <a :href="fishery['link']">{{ fishery['link'] }}</a>
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
  margin: 0 2em;
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
  margin: 40px 0;
}
td {
  text-align: left;
}
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'FisheriesReport',
  computed: {
    ...mapGetters({
      groupedFisheries: 'groupedFisheries',
      selectedRegion: 'selectedRegion',
      selectedGroup: 'selectedGroup',
    }),
  },
  methods: {
    reset: function () {
      this.$store.commit('closeReport')
    },
  },
}
</script>
