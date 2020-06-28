import Client from '@hydre/shimio/src/Client.js'
import Query from '@hydre/shimio-graphql/src/query.js'
import Debug from 'debug'

const debug = Debug('shimio')
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
      .forEach(({ name, endpoint, retry_strategy }) => {
        if (!name || !endpoint) throw new Error(`Invalid host [${ name }, ${ endpoint }]`)
        const log = debug.extend(name)
        const log_send = log.extend('[send]>>')
        const log_receive = log.extend('[receive]<<')
        const client = new Client({ host: endpoint, retry_strategy })
        const retry = () => {
          client.disconnect()
          return client.connect()
        }
        const query = Query(client)
        const disconnect = client.disconnect.bind(client)
        let ready
        const shim = {
          query,
          disconnect,
          ready: async () => {
            if (!ready) ready = client.connect()
            return ready.catch(() => {})
          }
        }
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
              tracker: 0,
              raw_operations: new Map(),
              result: undefined,
              state: ''
            }
          },
          props: ['query', 'variables'],
          methods: {
            set_operation(operation_name, rest) {
              log_receive('%O: %O', operation_name, rest)
              this.raw_operations.set(operation_name, rest)
              this.tracker++
              this.$emit(operation_name, rest)
            },
            is_loading(operation) {
              return !operation.data && !operation.errors.length
            },
            async execute_query() {
              await shim.ready()
              this.stop_query()
              if (typeof this.query !== 'string') {
                console.error(`[vue-shimio-graphl] > Invalid or missing query (${this.query})`)
                return
              }
              log_send('%O', this.query)
              this.result = query(this.query, this.variables || {})
              for await (const { operation_name, ...rest } of this.result.listen())
                this.set_operation(operation_name, rest)
            },
            stop_query() {
              if (this.result) this.result.stop()
              this.raw_operations.clear()
              this.tracker++
            }
          },
          watch: {
            async query() {
              await this.execute_query()
            }
          },
          async mounted() {
            window.addEventListener('unload', this.stop_query)
            await this.execute_query()
          },
          beforeDestroy() {
            window.removeEventListener('unload', this.stop_query)
            this.stop_query()
          }
        })
      })
  },
}
