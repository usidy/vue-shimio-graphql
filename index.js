import Client from '@hydre/shimio/src/Client.js'
import Query from '@hydre/shimio-graphql/src/query.js'
import Debug from 'debug'

const debug = Debug('shimio')
const replace_nulls = value => {
  if(value === null) return undefined
  switch (typeof value) {
    case 'object':
      if (Array.isArray(value)) return value.map(replace_nulls)
      const entries = Object
        .entries(value)
        .map(([ key, value ]) => [ key, replace_nulls(value) ])
      return Object.fromEntries(entries)
    default:
      return value
  }
}
const default_options = {
  root_name: 'graphql',
  hosts: [],
}

export default {
  install(Vue, { root_name, hosts } = default_options) {
    const key = `$${root_name}`
    Vue.prototype[key] = Object.create(null)
    if (!hosts || !Array.isArray(hosts))
      throw new Error(`[vue-shimio-graphl] ${ hosts } must be an array`)
    hosts
      .forEach(({
        name,
        endpoint,
        retry_strategy,
        on_connect = () => {},
        on_disconnect = () => {}
      }) => {
        if (!name || !endpoint) throw new Error(`Invalid host [${ name }, ${ endpoint }]`)
        const log = debug.extend(name)
        const log_send = log.extend('->')
        const log_receive = log.extend('<-')
        const client = Client({ host: endpoint, retry_strategy })
        const query = Query(client)
        const disconnect = client.disconnect.bind(client)
        const shim = {
          query: async (...parameters) => {
            await client.connect()
            return query(...parameters)
          },
          disconnect,
        }
        client.on('connected', () => {
          on_connect()
          client.once('disconnected', on_disconnect)
        })
        Vue.prototype[key][name] = shim
        Vue.component(name, {
          template: `<div>
                        <slot v-if="!operations.length" name="loading"/>
                        <slot v-else-if="operations.length"
                          v-for="([name, operation]) in operations"
                          :name="name"
                          :operation="operation"
                        />
                        <slot name="all" :operations="operations" />
                     </div>`,
          computed: {
            operations() {
              return this.tracker && [...this.raw_operations.entries()]
            }
          },
          data() {
            return {
              tracker: 1,
              raw_operations: new Map(),
              result: undefined,
              state: ''
            }
          },
          props: ['query', 'variables'],
          methods: {
            set_operation(operation_name, rest) {
              const normalized = replace_nulls(rest)
              log_receive('%O: %O', operation_name, normalized)
              this.raw_operations.set(operation_name, normalized)
              this.tracker++
              this.$emit(operation_name, normalized)
            },
            is_loading(operation) {
              return !operation.data && !operation.errors.length
            },
            async execute_query() {
              this.stop_query()
              if (typeof this.query !== 'string') {
                console.error(`[vue-shimio-graphl] > Invalid or missing query (${this.query})`)
                return
              }
              log_send('%O', this.query)
              this.result = await shim.query(this.query, this.variables || {})
              for await (const { operation_name, ...rest } of this.result.listen())
                this.set_operation(operation_name, rest)
            },
            stop_query() {
              if (this.result) this.result?.stop?.()
              this.raw_operations.clear()
              this.tracker++
            },
            on_leave() {
              this.stop_query()
              client.off('connected', ::this.execute_query)
              client.off('disconnected', ::this.on_connection_failure)
            },
            on_connection_failure() {
              this.stop_query()
              client.on('connected', ::this.execute_query)
            },
          },
          watch: {
            async query() {
              await this.execute_query()
            },
            async variables() {
              await this.execute_query()
            }
          },
          async mounted() {
            window.addEventListener('beforeunload', ::this.on_leave)
            client.once('disconnected', ::this.on_connection_failure)
            // connecting twice is a noop on @hydre/shimio/client
            await this.execute_query()
          },
          beforeDestroy() {
            window.removeEventListener('beforeunload', ::this.on_leave)
            this.on_leave()
          }
        })
      })
  },
}
