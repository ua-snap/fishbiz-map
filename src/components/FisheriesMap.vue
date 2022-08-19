<template>
  <div class="app-wrapper">
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
    </div>
    <div class="map-wrapper">
      &nbsp;
      <div id="map"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
}
input.filter {
  border: var(--vs-border-width) var(--vs-border-style) var(--vs-border-color);
  font-size: var(--vs-font-size);
  border-radius: 3px;
  padding: 7px;
}
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
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
      }
    )
    var center = [61.668562, -163.916567]
    this.map = L.map('map', {
      minZoom: 3,
      maxZoom: 8,
      scrollWheelZoom: false,
      layers: [baseLayer],
    }).setView(center, 4)

    this.enteredString = this.searchString
  },
  created() {
    this.$store.dispatch('fetchRegions')
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
  },
  methods: {
    addMarkers: function () {
      if (this.markerLayerGroup != undefined) {
        this.markerLayerGroup.clearLayers()
      }
      let markers = []
      Object.keys(this.filteredFisheries).forEach(region => {
        let regionLat = parseFloat(this.regions[region]['lat'])
        let regionLon = parseFloat(this.regions[region]['lon'])

        if (regionLon > 0) {
          regionLon -= 360
        }

        Object.keys(this.filteredFisheries[region]).forEach(group => {
          if (this.filteredFisheries[region][group].length > 0) {
            let lat = regionLat + _.random(-0.75, 0.75, true)
            let lon = regionLon + _.random(-0.75, 0.75, true)
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
      this.markerLayerGroup = L.layerGroup(markers).addTo(this.map)
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
  },
  unmounted() {
    this.map.remove()
    this.$store.commit('destroy')
  },
}
</script>
