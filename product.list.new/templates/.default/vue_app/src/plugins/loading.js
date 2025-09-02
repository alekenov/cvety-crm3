import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.use(Loading);

Vue.config.productionTip = false;

let bodyOverflow = null;

Vue.prototype.$showLoader = function () {
    this.$loader = this.$loading.show({
        container : null,
        canCancel : false,
    });

    if (bodyOverflow === null) {
        bodyOverflow = document.body.style.overflow;
    }

    document.body.style.overflow = 'hidden';
};
Vue.prototype.$hideLoader = function () {
    this.$nextTick(() => {
        this.$loader.hide();
        this.$loader = null;
        document.body.style.overflow = bodyOverflow || '';
    });
};
Vue.prototype.$isLoading = function () {
    return this.$loader;
};