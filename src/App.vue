<template>
  <div id="app">
    <ShimioQuery :query_string="graphql_query">
      <template #hello="data">
        <ShimioSlot :result="data">
          <template #loading></template>
          <template #error="errors">{{ errors }}</template>
          <template #data="data">{{ data }}</template>
        </ShimioSlot>
      </template>
      <template #pang="data">
        <ShimioSlot :result="data">
          <template #loading></template>
          <template #error="errors">{{ errors }}</template>
          <template #data="data">{{ data }}</template>
        </ShimioSlot>
      </template>
      <template #hey_listen="data">
        <ShimioSlot :result="data">
          <template #loading></template>
          <template #error="errors">{{ errors }}</template>
          <template #data="data">{{ data }}</template>
        </ShimioSlot>
      </template>
    </ShimioQuery>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      graphql_query: `
        query pang {
          pang
        }

        mutation hello {
          first: sendMessage(message: "howdy")
          then: sendMessage(message: "pls sir show vagana")
        }

        subscription hey_listen {
          onMessage
        }
      `,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
