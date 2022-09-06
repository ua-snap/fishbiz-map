<template>
  <div class="app-contents">
    <div class="filters">
      <input
        type="text"
        class="filter"
        placeholder="Search"
        @input="textSearch"
        v-model="enteredString"
      />
      <DropdownFilter
        class="filter"
        placeholder="Region"
        :options="regionOptions"
        mutation="filterRegion"
        :value="region"
      />
      <DropdownFilter
        class="filter"
        placeholder="Access"
        :options="accessOptions"
        mutation="filterAccess"
        :value="access"
      />
      <DropdownFilter
        class="filter"
        placeholder="Species"
        :options="speciesOptions"
        mutation="filterSpecies"
        :value="species"
      />
      <DropdownFilter
        class="filter"
        placeholder="Gear"
        :options="gearOptions"
        mutation="filterGear"
        :value="gear"
      />
      <button @click="clearFilters">Clear</button>
    </div>
    <div class="map-wrapper">
      &nbsp;
      <div v-show="markers == 'startup' || markers.length > 0" id="map"></div>
      <div v-show="markers.length === 0" id="noresults">
        <p>No results found</p>
        <button @click="clearFilters">Start Again</button>
      </div>
    </div>

    <div class="legend">
      <div v-for="group in groupOptions" :key="group">
        <img
          :src="require('@/assets/images/icons/' + group['slug'] + '.png')"
        />
        <br />{{ group['name'] }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-contents {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
}
.map-wrapper {
  position: relative;
  height: 100%;
}
.filters {
  display: flex;
  @media (max-width: 1000px) {
    flex-direction: column;
  }
}
.filter {
  flex-basis: 20%;
  --vs-search-input-placeholder-color: #757575;
  &::placeholder {
    font-size: 14px;
  }
}
input.filter {
  border: var(--vs-border-width) var(--vs-border-style) var(--vs-border-color);
  font-size: 14px;
  border-radius: 3px;
  padding: 10px 14px;
  background: none;
}
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 500;
}
#noresults {
  font-size: 60px;
}
.legend {
  display: flex;
  margin: 3rem 0 2rem 0;
  div {
    flex-grow: 1;
    img {
      width: 35px;
      height: 35px;
      margin-bottom: 0.5rem;
    }
  }
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
      markers: 'startup',
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

      this.markers = []
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
            this.markers.push(marker)
          }
        })
      })

      this.markerFeatureGroup = L.featureGroup(this.markers).addTo(this.map)
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
