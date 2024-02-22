
# CONTAINER API

<a name="Container"></a>

## Container : <code>object</code>
All properties of a container can be overridden with your own resolvers after the fact.
How to configure a container and its resolvers see: [SimplifiedAwilix](https://github.com/zacharygriffee/simplified-awilix)

**Kind**: global namespace  
**See**: https://github.com/zacharygriffee/simplified-awilix  
**Example**  
```js
// Typical flow

// stage is a singleton root container where you can fork into other containers I call stages.
import {stage} from "dependency-staging"

// You can register your own resolvers here.
stage.registerSingleton({
    appVersion: "1.0.1"
});
```
