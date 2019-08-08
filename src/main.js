import Vue from 'vue'
import App from './App.vue'
import flexTable from 'tm-flextable'
import iView from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(flexTable)
Vue.use(iView)

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
