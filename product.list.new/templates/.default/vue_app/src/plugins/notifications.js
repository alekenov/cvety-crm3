import Vue from 'vue';
import Notifications from 'vue-notification';

Vue.use(Notifications);

Vue.prototype.$error = function (title, text) {
    if (text === undefined) {
        text = title;
        title = 'Ошибка';
    }

    this.$notify({
        group: 'notification',
        type: 'error',
        title,
        text,
        duration: 6000
    });
};
Vue.prototype.$success = function (title, text) {
    if (text === undefined) {
        text = title;
        title = 'Уведомление';
    }

    this.$notify({
        group : 'notification',
        type  : 'success',
        title,
        text,
        duration: 6000
    });
};

Vue.prototype.$showErrors  = function (response) {
    if (!response?.errors) {
        console.error('error', response);
        return;
    }
    response.errors.reverse().forEach(error => {
        this.$error(error.message);
    })
};