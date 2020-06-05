import Vue from "vue";
import App from "./App.vue";
import Shimio from "./shimio-plugin.js";

Vue.config.productionTip = false;
Vue.use(Shimio, { host: "ws://localhost:3000" });
new Vue({
  render: (h) => h(App),
}).$mount("#app");
