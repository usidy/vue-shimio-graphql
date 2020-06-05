import ShimioQuery from "@cmp/shimioQuery.vue";
import ShimioSlot from "@cmp/shimioSlot.vue";

export default {
  install(Vue, options) {
    Vue.prototype.$shimio_host = options.host;
    Vue.component("ShimioSlot", ShimioSlot);
    Vue.component("ShimioQuery", ShimioQuery);
  },
};
