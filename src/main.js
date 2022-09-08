import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const app = createApp(App)
app.component('v-select', vSelect)
app.use(store)
app.mount('#fishbiz-map')
