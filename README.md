<h1 align=center>@sidy/vue-shimio-graphql</h1>
<p align=center>
  <img src="https://img.shields.io/github/license/usidy/vue-shimio-graphql.svg?style=for-the-badge" />
  <a href="https://www.npmjs.com/package/@sidy/vue-shimio-graphql">
    <img src="https://img.shields.io/npm/v/@sidy/vue-shimio-graphql.svg?logo=npm&style=for-the-badge" />
  </a>
  <img src="https://img.shields.io/npm/dw/@sidy/vue-shimio-graphql?logo=npm&style=for-the-badge" />
</p>

<h3 align=center>A VueJS plugin to make graphql websocket queries</h3>

## Install

```js
import graphql from '@sidy/vue-shimio-graphql'

Vue.use(graphql, {
  name: 'graphql', // vue prototype namespace
  hosts: [{
      name: 'Api',
      endpoint: 'ws://0.0.0.0:3000', // this.$graphql.Api.query('{ ping }')
      retry_strategy: () => 2000,
      on_connect: () => {},
      on_disconnect: () => {}
    }, {
      name: 'Auth',
      endpoint: 'ws://0.0.0.0:3001',
    }]
})
```

## Usage in components

```html
<template lang="pug">
    <Api query="query BLABLABLA { }" ref="api">
      <template #loading>
        Loading.. (v-if loading)
      </template>

      <template #BLABLABLA="{ operation }"> <!-- see @hydre/shimio-graphql -->
        The `foo` operation
      </template>

      <template #none="{ operation }"> <!-- in case of early error -->
        a `none` operation
      </template>

      <template #anon="{ operation }"> <!-- in case of unnamed query -->
        an `anon` operation
      </template>

      <template #all="{ operations }"> <!-- [name, operation] = operations -->
        All operation (always active)
      </template>
</template>
```

## Hybrid usage (recommended over raw js)

```html
<template lang="pug">
    <Api
      query="query foo { }" ref="api"
      @foo="operation => { }"
    />
</template>
```

## Usage in raw js

```js
const { query, disconnect } = Vue.prototype.$graphql.Auth
const queried = await query('{ ping }') // run some queries
const result = await queried.once() // get one result and abort
for await (const operation of queried.listen()) { // or iterate and listen
  result.stop() // unsubscribe from the operation
}
```
