<template>
  <div class="app-contents">
    <div class="filters pure-g">
      <div class="pure-u-4-24 filter">
        <input
          type="text"
          class="filter"
          placeholder="Search"
          @input="textSearch"
          v-model="enteredString"
        />
      </div>
      <div class="pure-u-4-24">
        <DropdownFilter
          class="filter"
          placeholder="Region"
          :options="regionOptions"
          mutation="filterRegion"
          :value="region"
        />
      </div>
      <div class="pure-u-4-24">
        <DropdownFilter
          class="filter"
          placeholder="Access"
          :options="accessOptions"
          mutation="filterAccess"
          :value="access"
        />
      </div>
      <div class="pure-u-4-24">
        <DropdownFilter
          class="filter"
          placeholder="Species"
          :options="speciesOptions"
          mutation="filterSpecies"
          :value="species"
        />
      </div>
      <div class="pure-u-4-24">
        <DropdownFilter
          class="filter"
          placeholder="Gear"
          :options="gearOptions"
          mutation="filterGear"
          :value="gear"
        />
      </div>
      <div class="pure-u">
        <button class="filter pure-button" @click="clearFilters">Clear</button>
      </div>
    </div>
    <div class="map-wrapper">
      &nbsp;
      <div id="map"></div>
    </div>
    <div class="legend pure-g">
      <div v-for="group in groupOptions" :key="group" class="pure-u-1-5">
        <img
          :src="require('@/assets/images/icons/' + group['slug'] + '.png')"
        />
        <br />{{ group['name'] }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input[type='text'].filter {
  width: 100%;
  margin: 0;
  font-size: 110%;
  padding: 4px;
  position: relative;
  top: 1px;
}
.filter {
  margin: 1rem 1rem 0;
}

#map {
  min-height: 150px;
  height: 75vh;
}

.legend {
  text-align: center;
  margin-top: 1rem;
}
</style>

<script>
import _ from 'lodash'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapGetters } from 'vuex'
import DropdownFilter from './DropdownFilter.vue'

export default {
  name: 'FisheriesMap',
  components: {
    DropdownFilter,
  },
  data() {
    return {
      map: undefined,
      markers: {},
      markerLayerGroup: undefined,
      enteredString: undefined,
    }
  },
  computed: {
    ...mapGetters({
      filteredFisheries: 'filteredFisheries',
      regions: 'regions',
      reportIsVisible: 'reportIsVisible',
      regionOptions: 'regionOptions',
      accessOptions: 'accessOptions',
      speciesOptions: 'speciesOptions',
      gearOptions: 'gearOptions',
      searchString: 'searchString',
      region: 'region',
      access: 'access',
      species: 'species',
      gear: 'gear',
      markerBounds: 'markerBounds',
      groupOptions: 'groupOptions',
    }),
  },
  mounted() {
    var baseLayer = new L.tileLayer.wms(
      'https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
      {
        layers: '0',
        format: 'image/png',
        transparent: true,
        attribution: 'USGS',
        baseLayer: true,
      }
    )
    this.map = L.map('map', {
      minZoom: 4,
      maxZoom: 8,
      zoomSnap: 0.1,
      scrollWheelZoom: false,
      layers: [baseLayer],
    })

    this.enteredString = this.searchString
  },
  created() {
    this.$store.dispatch('fetchAccess')
    this.$store.dispatch('fetchSpecies')
    this.$store.dispatch('fetchGear')
    this.$store.dispatch('fetchSeasons')
    this.$store.dispatch('fetchRegions')
    this.$store.dispatch('fetchGroups')
    this.$store.dispatch('fetchFisheries').then(() => {
      this.addMarkers()
    })
  },
  watch: {
    searchString() {
      this.addMarkers()
    },
    region() {
      this.addMarkers()
    },
    access() {
      this.addMarkers()
    },
    species() {
      this.addMarkers()
    },
    gear() {
      this.addMarkers()
    },
    markerBounds() {
      this.addMarkers()
    },
  },
  methods: {
    addMarkers: function () {
      // Slightly unusual way to do this to get around a "listener not found"
      // console log bug when removing the entire featureGroup at once.
      // Might be related to the following bug:
      // https://github.com/Leaflet/Leaflet.markercluster/issues/1062
      if (this.map != undefined) {
        this.map.eachLayer(layer => {
          if (!layer.options.baseLayer) {
            this.map.removeLayer(layer)
          }
        })
      }
      let markers = []
      let spread = 1.5
      let jitterOffsets = {
        finfish: { lat: 0, lon: 0 },
        'ground-fish': { lat: 0, lon: spread },
        crab: { lat: spread, lon: 0 },
        shrimp: { lat: 0, lon: -spread },
        'other-species': { lat: -spread, lon: 0 },
      }

      Object.keys(this.filteredFisheries).forEach(region => {
        let regionLat = parseFloat(this.regions[region]['lat'])
        let regionLon = parseFloat(this.regions[region]['lon'])

        if (regionLon > 0) {
          regionLon -= 360
        }

        Object.keys(this.filteredFisheries[region]).forEach(group => {
          if (this.filteredFisheries[region][group].length > 0) {
            // The weird math here is to deal with more northern latitudes being
            // slightly further apart. Marker icons appear equally offset from each
            // other using the math below.
            let latJitter =
              (65 / (Math.pow(regionLat, 1.475) * 1.5)) *
              jitterOffsets[group]['lat'] *
              5
            let lonJitter = jitterOffsets[group]['lon']

            let lat = regionLat + latJitter
            let lon = regionLon + lonJitter
            let icon = L.icon({
              iconUrl: require(`../assets/images/icons/${group}.png`),
              iconSize: [35, 35],
            })
            let marker = L.marker([lat, lon], { icon: icon })
            marker.on('click', () => {
              this.handleMapClick(region, group)
            })
            markers.push(marker)
          }
        })
      })
      this.markerFeatureGroup = L.featureGroup(markers).addTo(this.map)
      if (this.markerBounds == undefined) {
        let markerBounds = this.markerFeatureGroup.getBounds().pad(0.05)
        this.$store.commit('setMarkerBounds', markerBounds)
      } else {
        this.map.fitBounds(this.markerBounds)
        this.map.setMinZoom(this.map.getZoom())
      }
    },
    handleMapClick: function (region, group) {
      this.$store.commit('markerClicked', {
        region: region,
        group: group,
      })
    },
    textSearch: _.debounce(function () {
      this.$store.commit('filterSearchString', this.enteredString)
    }, 1000),
    clearFilters: function () {
      this.enteredString = undefined
      this.$store.commit('filterSearchString', undefined)
      this.$store.commit('filterRegion', undefined)
      this.$store.commit('filterAccess', undefined)
      this.$store.commit('filterSpecies', undefined)
      this.$store.commit('filterGear', undefined)
    },
  },
  unmounted() {
    this.map.remove()
    this.$store.commit('destroy')
  },
}
</script>
