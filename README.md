<h1 align=center>@usidy/vue-shimio-graphql</h1>
<p align=center>
  <img src="https://img.shields.io/github/license/usidy/vue-shimio-graphql.svg?style=for-the-badge" />
  <a href="https://www.npmjs.com/package/@usidy/vue-shimio-graphql">
    <img src="https://img.shields.io/npm/v/@usidy/vue-shimio-graphql.svg?logo=npm&style=for-the-badge" />
  </a>
  <img src="https://img.shields.io/npm/dw/@usidy/vue-shimio-graphql?logo=npm&style=for-the-badge" />
</p>

<h3 align=center>A VueJS plugin to make graphql websocket queries</h3>

## Install

```js
import graphql from '@usidy/vue-shimio-graphql'

Vue.use(graphql, {
  name: 'graphql', // vue prototype namespace
  hosts: {
    Api: 'ws://0.0.0.0:3000', // this.$graphql.Api.query('{ ping }')
    Auth: 'ws://0.0.0.0:3001',
  }
})
```

## Usage in components

```html
<template lang="pug">
    <Api query="query foo { }" ref="api">
      <template #loading>
        Loading.. (v-if loading)
      </template>

      <template #foo="{ operation }"> <!-- see @hydre/shimio-graphql -->
        The `foo` operation
      </template>

      <template #all="{ operations }"> <!-- [name, operation] = operations -->
        All operation (always active)
      </template>
</template>
```

## Usage in js

```js
const { query, disconnect } = Vue.prototype.$graphql.Auth
const result = await query('{ ping }')
for await (const operation of result.listen()) {
  result.stop()
}
```