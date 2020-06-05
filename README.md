# vue-shimio-graphql

## How to use

```
import Shimio from "./shimio-plugin.js";
Vue.use(Shimio, { host: "ws://localhost:3000" });
```

## Problems to fix

- `[_ws].ping is not a function`
- handle multiple host
- Need to change how the query is stored, to be similar to the mutation
- Cleanup dev dependencies & fils not needed once testing is done
