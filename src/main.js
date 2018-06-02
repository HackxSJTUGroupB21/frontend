// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue';
import ElementUI from 'element-ui';
import App from './App';
import router from './router';

require('normalize.css');
require('element-ui/lib/theme-chalk/index.css')
require('@/styles/global/index.less');

Vue.use(ElementUI)
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
