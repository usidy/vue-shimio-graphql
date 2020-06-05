<template>
  <div>
    <slot v-for="op in operations" :name="op.operation_name" :operation="op">
    </slot>
  </div>
</template>

<script>
import { Vue, Component, Prop } from "vue-property-decorator";
import { Client } from "@hydre/shimio";
import Query from "@hydre/shimio-graphql/src/query.js";

@Component()
export default class shimioQuery extends Vue {
  @Prop(String) query_string;
  query_stop = false;
  loading = true;
  error = false;

  operations = [];

  query = {};
  mutation = {};
  subscription = {};

  client = new Client({ host: this.$shimio_host });
  query = Query(this.client);

  async graphql_query() {
    try {
      return await this.query(this.query_string);
    } catch (error) {
      console.error(error);
      this.error = error;
    }
  }

  async mounted() {
    console.log("Props", this);
    console.log(this.$shimio_host);
    try {
      await this.client.connect();
      const { listen, stop } = await this.graphql_query();

      this.query_stop = stop;

      for await (const chunk of listen()) {
        let should_add = true;
        for (let i = 0; i < this.operations.length; i++) {
          const op = this.operations[i];
          if (op.operation_name === chunk.operation_name) {
            if (chunk.operation_type === "subscription") {
              op.data.push(chunk.data);
            }
            should_add = false;
          }
        }
        if (should_add) {
          if (chunk.operation_type === "subscription") {
            const new_obj = {
              ...chunk,
              data: [chunk.data],
            };
            this.operations.push(new_obj);
          } else {
            this.operations.push(chunk);
          }
        }
        this.loading = false;
      }
      client.disconnect();
    } catch (error) {
      console.error(error);
      this.error = error;
    }
  }

  beforeDestroy() {
    if (!this.query_stop) {
      this.query_stop();
    }
  }
}
</script>
