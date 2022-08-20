<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<style lang="scss" scoped>
#map {
  height: 100vh;
  width: 100vw;
}
</style>

<script>
import _ from 'lodash'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapGetters } from 'vuex'

export default {
  name: 'FisheriesMap',
  data() {
    return {
      map: undefined,
      markers: {},
    }
  },
  computed: {
    ...mapGetters({
      groupedFisheries: 'groupedFisheries',
      regions: 'regions',
      reportIsVisible: 'reportIsVisible',
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
      minZoom: 4.5,
      maxZoom: 8,
      scrollWheelZoom: false,
      layers: [baseLayer],
    }).setView(center, 4.5)
  },
  created() {
    this.$store.dispatch('fetchRegions')
    this.$store.dispatch('fetchFisheries').then(() => {
      this.addMarkers()
    })
  },
  methods: {
    addMarkers: function () {
      let spread = 1.2
      let jitterOffsets = {
        finfish: { lat: 0, lon: 0 },
        'ground-fish': { lat: 0, lon: spread },
        crab: { lat: spread, lon: 0 },
        shrimp: { lat: 0, lon: -spread },
        'other-species': { lat: -spread, lon: 0 },
      }

      Object.keys(this.groupedFisheries).forEach(region => {
        let regionLat = parseFloat(this.regions[region]['lat'])
        let regionLon = parseFloat(this.regions[region]['lon'])

        if (regionLon > 0) {
          regionLon -= 360
        }

        Object.keys(this.groupedFisheries[region]).forEach(group => {
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
          marker.addTo(this.map)
          if (!_.has(this.markers, region)) {
            this.markers[region] = {}
          }
          this.markers[region][group] = marker
        })
      })
    },
    handleMapClick: function (region, group) {
      this.$store.commit('markerClicked', {
        region: region,
        group: group,
      })
    },
  },
  unmounted() {
    this.map.remove()
    this.$store.commit('destroy')
  },
}
</script>
