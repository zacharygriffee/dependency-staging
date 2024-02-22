
# PREMADE API

<a name="premade"></a>

## premade : <code>object</code>
Premade dependencies that can be added to your stages.
If you are running in node, all dependencies should be present in node_modules.
If you are in browser, add them to import map or else it will be imported
via the Stage.npmCdnResolver

<pre>
    // Dependencies needed to import premade
    b4a, compact-encoding, rxjs, rxjs/operators
</pre>

**Kind**: global namespace  
**Example**  
```js
import {stage, premade} from "dependency-staging";
stage.put(premade);
await stage.install();
```

* [premade](#premade) : <code>object</code>
    * [.basic](#premade.basic) : <code>object</code>
        * [.b4a](#premade.basic.b4a)
        * [.compactEncoding](#premade.basic.compactEncoding)
    * [.rx](#premade.rx) : <code>object</code>
        * [.observables](#premade.rx.observables)
        * [.operators](#premade.rx.operators)

<a name="premade.basic"></a>

### premade.basic : <code>object</code>
A set of basic dependencies that I personally use in almost every project
<pre>
    // Dependencies needed to import premade.basic
    b4a, compact-encoding
</pre>

**Kind**: static namespace of [<code>premade</code>](#premade)  
**Example**  
```js
stage.put(premade.basic);
```

* [.basic](#premade.basic) : <code>object</code>
    * [.b4a](#premade.basic.b4a)
    * [.compactEncoding](#premade.basic.compactEncoding)

<a name="premade.basic.b4a"></a>

#### basic.b4a
Buffer handling

**Kind**: static property of [<code>basic</code>](#premade.basic)  
**See**: https://github.com/holepunchto/b4a  
**Example**  
```js
stage.put(premade.basic.b4a);
```
<a name="premade.basic.compactEncoding"></a>

#### basic.compactEncoding
Handling encoding to and from buffers in a compact way.

**Kind**: static property of [<code>basic</code>](#premade.basic)  
**See**: https://github.com/holepunchto/compact-encoding  
**Example**  
```js
stage.put(premade.basic.compactEncoding);
```
<a name="premade.rx"></a>

### premade.rx : <code>object</code>
Add RxJS support to a stage. This will import directly into the root stage as a merger of both
rxjs.observables and rxjs.operators with the name 'rx'
<pre>
    // Dependencies needed to import premade.rx
    rxjs, rxjs/operators
</pre>

**Kind**: static namespace of [<code>premade</code>](#premade)  
**Example**  
```js
await import("dependency-staging/premade/rx");
const {rx} = stage;
// rx is now available to use.
```

* [.rx](#premade.rx) : <code>object</code>
    * [.observables](#premade.rx.observables)
    * [.operators](#premade.rx.operators)

<a name="premade.rx.observables"></a>

#### rx.observables
import rxjs observables separately from operators. If you are using both operators and observables
it is best to just import dependency-staging/premade/rx

**Kind**: static property of [<code>rx</code>](#premade.rx)  
**See**: https://rxjs.dev/api  
**Example**  
```js
import {observables} from "dependency-staging/premade/rx/observables.js";
stage.put(observables);
await stage.install();
const rxjsObservables = stage.execute("rxjs.observables")
```
<a name="premade.rx.operators"></a>

#### rx.operators
import rxjs operators separately from observables. If you are using both operators and observables
it is best to just import dependency-staging/premade/rx

**Kind**: static property of [<code>rx</code>](#premade.rx)  
**See**: https://rxjs.dev/api  
**Example**  
```js
import {operators} from "dependency-staging/premade/rx/operators.js";
stage.put(operators);
await stage.install();
const rxjsOperators= stage.execute("rxjs.operators")
```
