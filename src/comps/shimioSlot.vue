<template>
  <div>
    <div v-if="loading && error === false">
      <slot name="loading" :loading="loading">
        Available loading props: `loading`, just a Boolean
      </slot>
    </div>
    <div v-else-if="error">
      <slot name="error" :error="error">
        Available error props: `error`
      </slot>
    </div>
    <div v-else>
      <slot name="data" :data="data">Available data props: `data`</slot>
    </div>
  </div>
</template>

<script>
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class shiomioSlot extends Vue {
  @Prop(Object) result;
  query_stop = false;
  loading = true;
  error = false;
  data = "";

  operation_name = "";
  operation_type = "";

  mounted() {
    const op = this.result.operation;
    this.operation_name = op.operation_name;
    this.operation_type = op.operation_type;
    this.data = op.data;
    if (op.hasOwnProperty("errors")) {
      this.error = op.errors;
    }
    this.loading = false;
  }
}
</script>
