import Vue from 'vue';
import App from 'App.vue';
import store from 'store';
import 'plugins/loading.js';
import 'plugins/notifications.js';

Vue.config.productionTip = false;

Vue.config.errorHandler = (err, vm, info) => {
    console.log(err, vm, info);
};

new Vue({
    render : h => h(App),
    store,
}).$mount('#app');
