import { createStore } from 'vuex'
import _ from 'lodash'

function dictifyOptions(options) {
  let dict = {}
  options.forEach(option => {
    dict[option.slug] = option.name
  })
  return dict
}

export default createStore({
  state: {
    layer: undefined,
    searchString: undefined,
    regions: undefined,
    access: undefined,
    species: undefined,
    gear: undefined,
    fisheries: undefined,
    groupedFisheries: undefined,
    selectedRegion: undefined,
    selectedGroup: undefined,
    reportIsVisible: false,
    regionOptions: undefined,
    accessOptions: undefined,
    speciesOptions: undefined,
    gearOptions: undefined,
    seasonDict: undefined,
    groupDict: undefined,
    markerBounds: undefined,
  },

  getters: {
    regions(state) {
      return state.regions
    },
    fisheries(state) {
      return state.fisheries
    },
    groupedFisheries(state) {
      return state.groupedFisheries
    },
    filteredFisheries(state) {
      let filterKeys = ['region', 'access', 'species', 'gear']
      let filtered = _.cloneDeep(state.groupedFisheries)

      // Apply dropdown filters
      let newFiltered = {}
      filterKeys.forEach(filterKey => {
        Object.keys(filtered).forEach(region => {
          newFiltered[region] = {}
          Object.keys(filtered[region]).forEach(group => {
            newFiltered[region][group] = _.filter(
              filtered[region][group],
              fishery => {
                if (
                  _.includes([undefined, null, 'all'], state[filterKey]) ||
                  fishery[filterKey] == state[filterKey]
                ) {
                  return true
                }
              }
            )
          })
        })
        filtered = _.cloneDeep(newFiltered)
      })

      // Perform text search if a search string was entered
      if (state.searchString != undefined) {
        newFiltered = {}
        Object.keys(filtered).forEach(region => {
          newFiltered[region] = {}
          Object.keys(filtered[region]).forEach(group => {
            newFiltered[region][group] = _.filter(
              filtered[region][group],
              fishery => {
                let searchableText = ''
                filterKeys.forEach(filterKey => {
                  searchableText += fishery[filterKey]
                })
                searchableText = searchableText.toLowerCase()
                let searchString = state.searchString.toLowerCase()
                return searchableText.indexOf(searchString) != -1
              }
            )
          })
        })
        filtered = _.cloneDeep(newFiltered)
      }

      return filtered
    },
    selectedRegion(state) {
      return state.selectedRegion
    },
    selectedGroup(state) {
      return state.selectedGroup
    },
    reportIsVisible(state) {
      return state.reportIsVisible
    },
    regionDict(state) {
      return dictifyOptions(state.regionOptions)
    },
    regionOptions(state) {
      return state.regionOptions
    },
    accessDict(state) {
      return dictifyOptions(state.accessOptions)
    },
    accessOptions(state) {
      return state.accessOptions
    },
    speciesDict(state) {
      return dictifyOptions(state.speciesOptions)
    },
    speciesOptions(state) {
      return state.speciesOptions
    },
    gearDict(state) {
      return dictifyOptions(state.gearOptions)
    },
    gearOptions(state) {
      return state.gearOptions
    },
    seasonDict(state) {
      return state.seasonDict
    },
    groupDict(state) {
      return state.groupDict
    },
    searchString(state) {
      return state.searchString
    },
    region(state) {
      return state.region
    },
    access(state) {
      return state.access
    },
    species(state) {
      return state.species
    },
    gear(state) {
      return state.gear
    },
    markerBounds(state) {
      return state.markerBounds
    },
  },

  mutations: {
    destroy(state) {
      state.layer = undefined
    },
    setRegions(state, regions) {
      state.regions = regions
    },
    setRegionOptions(state, regionOptions) {
      state.regionOptions = regionOptions
    },
    setAccessOptions(state, accessOptions) {
      state.accessOptions = accessOptions
    },
    setSpeciesOptions(state, speciesOptions) {
      state.speciesOptions = speciesOptions
    },
    setGearOptions(state, gearOptions) {
      state.gearOptions = gearOptions
    },
    setSeasonDict(state, seasonDict) {
      state.seasonDict = seasonDict
    },
    setGroupDict(state, groupDict) {
      state.groupDict = groupDict
    },
    setFisheries(state, fisheries) {
      state.fisheries = fisheries
    },
    setGroupedFisheries(state, grouped) {
      state.groupedFisheries = grouped
    },
    markerClicked(state, payload) {
      state.selectedRegion = payload['region']
      state.selectedGroup = payload['group']
      state.reportIsVisible = true
    },
    closeReport(state) {
      state.selectedRegion = undefined
      state.selectedGroup = undefined
      state.reportIsVisible = false
    },
    filterSearchString(state, searchString) {
      state.searchString = searchString
    },
    filterRegion(state, region) {
      state.region = region
    },
    filterAccess(state, access) {
      state.access = access
    },
    filterSpecies(state, species) {
      state.species = species
    },
    filterGear(state, gear) {
      state.gear = gear
    },
    setMarkerBounds(state, markerBounds) {
      state.markerBounds = markerBounds
    },
  },

  actions: {
    async fetchRegions(context) {
      let response = await fetch(
        process.env.VUE_APP_WORDPRESS_URL + '/wp-json/wp/v2/region?per_page=100'
      )

      let data = await response.json()
      let regions = {}

      data.forEach(result => {
        let name = result['name']
        let slug = result['slug']

        regions[slug] = {
          name: name,
        }

        regions[slug]['lat'] = result['latitude']
        regions[slug]['lon'] = result['longitude']
      })

      let regionOptions = _.map(data, result => {
        return {
          slug: result['slug'],
          name: result['name'],
        }
      })

      context.commit('setRegions', regions)
      context.commit('setRegionOptions', regionOptions)
    },
    async fetchAccess(context) {
      let response = await fetch(
        process.env.VUE_APP_WORDPRESS_URL + '/wp-json/wp/v2/entry?per_page=100'
      )

      let data = await response.json()
      let accessOptions = _.map(data, result => {
        return {
          slug: result['slug'],
          name: result['name'],
        }
      })

      context.commit('setAccessOptions', accessOptions)
    },
    async fetchSpecies(context) {
      let response = await fetch(
        process.env.VUE_APP_WORDPRESS_URL +
          '/wp-json/wp/v2/species?per_page=100'
      )

      let data = await response.json()
      let speciesOptions = _.map(data, result => {
        return {
          slug: result['slug'],
          name: result['name'],
        }
      })

      context.commit('setSpeciesOptions', speciesOptions)
    },
    async fetchGear(context) {
      let response = await fetch(
        process.env.VUE_APP_WORDPRESS_URL + '/wp-json/wp/v2/gear?per_page=100'
      )

      let data = await response.json()
      let gearOptions = _.map(data, result => {
        return {
          slug: result['slug'],
          name: result['name'],
        }
      })

      context.commit('setGearOptions', gearOptions)
    },
    async fetchSeasons(context) {
      let response = await fetch(
        process.env.VUE_APP_WORDPRESS_URL + '/wp-json/wp/v2/season?per_page=100'
      )

      let data = await response.json()

      let seasonDict = {}
      data.forEach(result => {
        seasonDict[result['slug']] = result['name']
      })

      context.commit('setSeasonDict', seasonDict)
    },
    async fetchGroups(context) {
      let response = await fetch(
        process.env.VUE_APP_WORDPRESS_URL +
          '/wp-json/wp/v2/fish_group?per_page=100'
      )

      let data = await response.json()

      let groupDict = {}
      data.forEach(result => {
        groupDict[result['slug']] = result['name']
      })

      context.commit('setGroupDict', groupDict)
    },
    async fetchFisheries(context) {
      let pages = _.range(1, 3)
      let urls = _.map(pages, page => {
        return (
          process.env.VUE_APP_WORDPRESS_URL +
          '/wp-json/wp/v2/fishery?per_page=100&page=' +
          page
        )
      })

      // Adapted from response to this StackOverflow post:
      // https://stackoverflow.com/questions/61449048/making-multiple-api-requests-at-once-using-fetch-in-vue
      let results
      await Promise.all(
        _.map(urls, url => {
          return fetch(url).then(
            res => (res.ok && res.json()) || Promise.reject(res)
          )
        })
      ).then(data => {
        results = [].concat.apply([], data)
      })

      let fisheries = []
      let grouped = {}

      results.forEach(result => {
        let name = result['title']['rendered']

        let regions = _.map(result['fishery_regions'], region => {
          return region['slug']
        })

        // TODO: Add some error checking here in case there are no array elements.
        let group = result['fishery_group'][0]['slug']
        let access = result['fishery_entry_type'][0]['slug']
        let species = result['fishery_species'][0]['slug']
        let gear = result['fishery_gear'][0]['slug']

        let seasons = _.map(result['fishery_seasons'], season => {
          return season['slug']
        })

        let code = result['fishery_code']
        let link = result['link_to_resource']

        let fishery = {
          name: name,
          region: regions,
          seasons: seasons,
          group: group,
          species: species,
          access: access,
          gear: gear,
          code: code,
          link: link,
        }

        fisheries.push(fishery)

        regions.forEach(region => {
          if (!_.has(grouped, region)) {
            grouped[region] = {}
          }
          if (!_.has(grouped[region], group)) {
            grouped[region][group] = []
          }
          grouped[region][group].push(fishery)
        })
      })

      context.commit('setFisheries', fisheries)
      context.commit('setGroupedFisheries', grouped)
    },
  },
})
