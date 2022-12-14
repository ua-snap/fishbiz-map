import { createStore } from 'vuex'
import _ from 'lodash'

function dictifyOptions(options) {
  let dict = {}
  options.forEach(option => {
    dict[option.slug] = option.name
  })
  return dict
}

function sortAlphabetically(arr) {
  // If "n/a" or "N/A" option exists, move it to the bottom
  let na_index = _.findIndex(arr, option => {
    return option.name.toLowerCase() == 'n/a'
  })
  if (na_index != -1) {
    var na_option = arr.splice(na_index, 1).pop()
  }
  let sorted = arr.sort((a, b) => a.name.localeCompare(b.name))
  if (na_option != undefined) {
    sorted.push(na_option)
  }
  return sorted
}

function removeDuplicates(arr) {
  let jsonObject = arr.map(JSON.stringify)
  let uniqueSet = new Set(jsonObject)
  return sortAlphabetically(Array.from(uniqueSet).map(JSON.parse))
}

function processRegions(context, results) {
  let regions = {}

  results.forEach(result => {
    if (result['fishery_regions']) {
      result['fishery_regions'].forEach(region => {
        let name = region['name']
        let slug = region['slug']

        regions[slug] = {
          slug: slug,
          name: name,
        }

        regions[slug]['lat'] = region['latitude']
        regions[slug]['lon'] = region['longitude']
      })
    }
  })

  let regionOptions = _.map(regions, region => {
    return {
      slug: region['slug'],
      name: region['name'],
    }
  })

  context.commit('setRegions', regions)
  context.commit('setRegionOptions', sortAlphabetically(regionOptions))
}

function processAccess(context, results) {
  let allAccess = []
  results.forEach(result => {
    result['fishery_entry_type'].forEach(access => {
      allAccess.push({
        slug: access['slug'],
        name: access['name'],
      })
    })
  })
  let accessOptions = removeDuplicates(allAccess)

  context.commit('setAccessOptions', accessOptions)
}

function processSpecies(context, results) {
  let allSpecies = []
  results.forEach(result => {
    result['fishery_species'].forEach(species => {
      allSpecies.push({
        slug: species['slug'],
        name: species['name'],
      })
    })
  })
  let speciesOptions = removeDuplicates(allSpecies)

  context.commit('setSpeciesOptions', speciesOptions)
}

function processSeasons(context, results) {
  let seasonDict = {}
  results.forEach(result => {
    result['fishery_seasons'].forEach(season => {
      seasonDict[season['slug']] = season['name']
    })
  })

  context.commit('setSeasonDict', seasonDict)
}

function processGroups(context, results) {
  let allGroups = []
  results.forEach(result => {
    result['fishery_group'].forEach(group => {
      allGroups.push({
        slug: group['slug'],
        name: group['name'],
      })
    })
  })
  let groupOptions = removeDuplicates(allGroups)

  context.commit('setGroupOptions', groupOptions)
}

function processGear(context, results) {
  let allGear = []
  results.forEach(result => {
    result['fishery_gear'].forEach(gear => {
      allGear.push({
        slug: gear['slug'],
        name: gear['name'],
      })
    })
  })
  let gearOptions = removeDuplicates(allGear)

  context.commit('setGearOptions', gearOptions)
}

function processFisheries(context, results) {
  let fisheries = []
  let grouped = {}

  processRegions(context, results)
  processAccess(context, results)
  processSpecies(context, results)
  processSeasons(context, results)
  processGroups(context, results)
  processGear(context, results)

  results.forEach(result => {
    let name = result['title']['rendered']

    let regions = _.map(result['fishery_regions'], region => {
      return region['slug']
    })

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
}

export default createStore({
  state: {
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
    groupOptions: undefined,
    groupDict: undefined,
    markerBounds: undefined,
    error: false,
  },

  getters: {
    groupSubtitles() {
      return {
        crab: 'The crab category includes dungeness, king, tanner, and other crab.',
        finfish:
          'The finfish category includes herring, salmon, and other freshwater finfish.',
        'ground-fish':
          'The groundfish category includes halibut, Pacific cod, pollock, rockfish, and sablefish.',
        'other-species':
          'The other species category includes clams, geoducks, octopuses, scallops, sea urchins, snails, and squid.',
      }
    },
    regions(state) {
      return state.regions
    },
    fisheries(state) {
      return state.fisheries
    },
    groupedFisheries(state) {
      return state.groupedFisheries
    },
    filteredFisheries(state, getters) {
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
                let filterNotSet = _.includes(
                  [undefined, null, 'all'],
                  state[filterKey]
                )
                let filterMatched = _.includes(
                  fishery[filterKey],
                  state[filterKey]
                )
                if (filterKey == 'region' && region != state[filterKey]) {
                  filterMatched = false
                }
                if (filterNotSet || filterMatched) {
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
        let searchString = state.searchString.toLowerCase()

        let textSearchKeys = [
          'name',
          'code',
          'region',
          'access',
          'species',
          'gear',
          'seasons',
        ]

        // Use these to perform text search on human readable strings, not slugs
        let dictLookups = {
          region: getters.regionDict,
          access: getters.accessDict,
          species: getters.speciesDict,
          gear: getters.gearDict,
          seasons: getters.seasonDict,
        }

        // If the provided search string matches one and only one region, save
        // this region for later to prevent fisheries belonging to multiple
        // regions from showing up more than once on the map
        let matchedRegion = null
        let regions = Object.keys(filtered)
        let matchedRegions = _.filter(regions, slug => {
          let humanReadable = dictLookups['region'][slug]
          humanReadable = humanReadable.toLowerCase()
          return humanReadable.indexOf(searchString) != -1
        })
        if (matchedRegions.length == 1) {
          matchedRegion = matchedRegions[0]
        }

        newFiltered = {}
        Object.keys(filtered).forEach(region => {
          newFiltered[region] = {}
          Object.keys(filtered[region]).forEach(group => {
            newFiltered[region][group] = _.filter(
              filtered[region][group],
              fishery => {
                let searchableText = ''
                textSearchKeys.forEach(textSearchKey => {
                  if (
                    matchedRegion != null &&
                    textSearchKey == 'region' &&
                    matchedRegion != region
                  ) {
                    return false
                  }
                  let fieldValue = fishery[textSearchKey]
                  // If taxonomy slug(s), translate into human readable
                  // string(s), otherwise use string as-is.
                  if (_.isArray(fieldValue)) {
                    searchableText += _.map(fieldValue, slug => {
                      return dictLookups[textSearchKey][slug]
                    }).join()
                  } else {
                    if (_.has(dictLookups, textSearchKey)) {
                      searchableText += dictLookups[textSearchKey][fieldValue]
                    } else {
                      searchableText += fieldValue
                    }
                  }
                })
                searchableText = searchableText.toLowerCase()
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
    groupOptions(state) {
      return state.groupOptions
    },
    groupDict(state) {
      return dictifyOptions(state.groupOptions)
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
    error(state) {
      return state.error
    },
  },

  mutations: {
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
    setGroupOptions(state, groupOptions) {
      state.groupOptions = groupOptions
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
    setError(state) {
      state.error = true
    },
  },

  actions: {
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
          return fetch(url).then(response => {
            if (response.status != 200) {
              context.commit('setError')
            }
            return (response.ok && response.json()) || Promise.reject(response)
          })
        })
      ).then(data => {
        results = [].concat.apply([], data)
      })
      try {
        processFisheries(context, results)
      } catch {
        context.commit('setError')
      }
    },
  },
})
