import { createStore } from 'vuex'
import _ from "lodash";

export default createStore({
    state: {
      layer: undefined,
      regions: undefined,
      fisheries: undefined,
      groupedFisheries: undefined,
      selectedRegion: undefined,
      selectedGroup: undefined,
      reportIsVisible: false,
    },
  
    getters: {
      regions(state) {
        return state.regions;
      },
      fisheries(state) {
        return state.fisheries;
      },
      groupedFisheries(state) {
        return state.groupedFisheries;
      },
      selectedRegion(state) {
        return state.selectedRegion
      },
      selectedGroup(state) {
        return state.selectedGroup
      },
      reportIsVisible(state) {
        return state.reportIsVisible;
      },
    },
  
    mutations: {
      destroy(state) {
        state.layer = undefined;
      },
      setRegions(state, regions) {
        state.regions = regions;
      },
      setFisheries(state, fisheries) {
        state.fisheries = fisheries;
      },
      setGroupedFisheries(state, grouped) {
        state.groupedFisheries = grouped;
      },
      markerClicked(state, payload) {
        state.selectedRegion = payload['region']
        state.selectedGroup = payload['group']
        state.reportIsVisible = true
      },
      closeReport(state) {
        state.selectedRegion = undefined;
        state.selectedGroup = undefined;
        state.reportIsVisible = false;
      },
    },
  
    actions: {
      async fetchRegions(context) {
        let response = await fetch(
          "https://snapsandbox.wpcomstaging.com/wp-json/wp/v2/region?per_page=100"
        );
        
        let data = await response.json()
        let regions = {};
  
        data.forEach((result) => {
          let name = result["name"];
          let slug = result["slug"];
  
          regions[slug] = {
            name: name,
          };
  
          if (result["latitude"] != "") {
            regions[slug]["lat"] = result["latitude"];
          } else {
            regions[slug]["lat"] = _.random(50, 70, true);
          }
  
          if (result["longitude"] != "") {
            regions[slug]["lon"] = result["longitude"];
          } else {
            regions[slug]["lon"] = _.random(-180, -150, true);
          }
        });
  
        context.commit("setRegions", regions);
      },
      async fetchFisheries(context) {
        let pages = _.range(1, 3)
        let urls = _.map(pages, (page) => {
          return "https://snapsandbox.wpcomstaging.com/wp-json/wp/v2/fishery?per_page=100&page=" + page
        })

        // Adapted from response to this StackOverflow post:
        // https://stackoverflow.com/questions/61449048/making-multiple-api-requests-at-once-using-fetch-in-vue
        let results
        await Promise.all(
          _.map(urls, (url) => {
            return fetch(url).then(res => res.ok && res.json() || Promise.reject(res))
          })
        ).then(data => {
          results = [].concat.apply([], data);
        })

        let fisheries = [];
        let grouped = {};
  
        results.forEach((result) => {
          let name = result["title"]["rendered"];
  
          let regions = _.map(result["fishery_regions"], (region) => {
            return region["slug"];
          });
  
          let joinedRegions = regions.join(", ");
  
          // TODO: Add some error checking here in case there are no array elements.
          let group = result["fishery_group"][0]["slug"];
          let entry = result["fishery_entry_type"][0]["slug"];
          let species = result["fishery_species"][0]["slug"];
          let gear = result["fishery_gear"][0]["slug"];
  
          let joinedSeasons = _.map(result["fishery_seasons"], (season) => {
            return season["slug"];
          }).join(", ");
  
          let code = result["fishery_code"];
          let link = result["link_to_resource"];
  
          let fishery = {
            name: name,
            region: joinedRegions,
            seasons: joinedSeasons,
            group: group,
            species: species,
            entry: entry,
            gear: gear,
            code: code,
            link: link,
          };
  
          fisheries.push(fishery);
  
          regions.forEach((region) => {
            if (!_.has(grouped, region)) {
              grouped[region] = {};
            }
            if (!_.has(grouped[region], group)) {
              grouped[region][group] = [];
            }
            grouped[region][group].push(fishery);
          });
        });
  
        context.commit("setFisheries", fisheries);
        context.commit("setGroupedFisheries", grouped);
      },
    },
  })