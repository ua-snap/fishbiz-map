<template>
  <div class="app-contents">
    <div v-show="!reportIsVisible" class="filters pure-g">
      <div class="pure-u-md-4-24 pure-u-1 filter">
        <input
          type="text"
          class="filter"
          placeholder="Search fisheries&hellip;"
          @input="textSearch"
          v-model="enteredString"
        />
      </div>
      <div class="pure-u-md-4-24 pure-u-1">
        <DropdownFilter
          class="filter"
          placeholder="Region"
          :options="regionOptions"
          mutation="filterRegion"
          :value="region"
        />
      </div>
      <div class="pure-u-md-4-24 pure-u-1">
        <DropdownFilter
          class="filter"
          placeholder="Access"
          :options="accessOptions"
          mutation="filterAccess"
          :value="access"
        />
      </div>
      <div class="pure-u-md-4-24 pure-u-1">
        <DropdownFilter
          class="filter"
          placeholder="Species"
          :options="speciesOptions"
          mutation="filterSpecies"
          :value="species"
        />
      </div>
      <div class="pure-u-md-4-24 pure-u-1">
        <DropdownFilter
          class="filter"
          placeholder="Gear"
          :options="gearOptions"
          mutation="filterGear"
          :value="gear"
        />
      </div>
      <div class="pure-u">
        <button class="filter pure-button" @click="clearFilters">
          Reset filters
        </button>
      </div>
    </div>
    <div class="map-wrapper">
      <div
        v-show="markers == 'startup' || markers.length > 0"
        id="fishbiz-map--leaflet"
      ></div>
      <div v-show="markers.length === 0" id="noresults">
        <p>
          <strong>There are no matching results</strong> found for the
          combination of filters you have selected. Choose different filters, or
          click the button below to reset all filters and start again.
        </p>
        <button class="pure-button" @click="clearFilters">
          Clear filters and start again
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input[type='text'].filter {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  font-size: 110%;
  padding: 4px 8px;
  position: relative;
  top: 1px;

  &::placeholder {
    color: #000;
  }
}

.filters {
  margin-bottom: 1rem;
}

.filter {
  margin: 1rem 1rem 0;
  font-family: 'Raleway', sans-serif;
}

#fishbiz-map--leaflet {
  min-height: 150px;
  height: 75vh;
  z-index: 500;
}

#noresults {
  padding: 1.5rem;
  margin: 1.5rem auto;
  max-width: 768px;
  font-size: calc(14px + 0.3rem);
}

.app-contents {
  flex-grow: 1;
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
    this.map = L.map('fishbiz-map--leaflet', {
      minZoom: 4,
      maxZoom: 8,
      zoomSnap: 0.1,
      scrollWheelZoom: false,
      layers: [baseLayer],
    })

    this.enteredString = this.searchString
  },
  created() {
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
    reportIsVisible() {
      if (this.reportIsVisible == false) {
        setTimeout(() => {
          this.map.invalidateSize()
          this.map.fitBounds(this.markerBounds)
        })
        this.markers.forEach(marker => {
          marker.setOpacity(1.0)
        })
      }
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
            let marker = L.marker([lat, lon], {
              icon: icon,
            })
            marker.on('click', () => {
              this.handleMapClick(marker, region, group)
            })
            this.markers.push(marker)
          }
        })
      })

      this.markerFeatureGroup = L.featureGroup(this.markers).addTo(this.map)
      if (this.markerBounds == undefined) {
        let markerBounds = this.markerFeatureGroup.getBounds().pad(0.05)
        this.$store.commit('setMarkerBounds', markerBounds)
        this.map.fitBounds(this.markerBounds)
        this.map.setMinZoom(this.map.getZoom())
      }
    },
    handleMapClick: function (clickedMarker, region, group) {
      this.$store.commit('markerClicked', {
        region: region,
        group: group,
      })
      this.markers.forEach(marker => {
        if (marker._leaflet_id != clickedMarker._leaflet_id) {
          marker.setOpacity(0.2)
        } else {
          marker.setOpacity(1.0)
        }
      })
      setTimeout(() => {
        this.map.invalidateSize()
        this.map.setView(clickedMarker.getLatLng())
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
  },
}
</script>
