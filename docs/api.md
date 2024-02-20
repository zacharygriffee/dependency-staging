
### Dependency Staging API
## Objects

<dl>
<dt><a href="#Container">Container</a> : <code>object</code></dt>
<dd><p>All properties of a container can be overridden with your own resolvers after the fact.
How to configure a container and its resolvers see: <a href="https://github.com/zacharygriffee/simplified-awilix">SimplifiedAwilix</a></p>
</dd>
<dt><a href="#Dependency">Dependency</a> : <code>object</code></dt>
<dd><p>A Container that resolves and contains dependency.</p>
</dd>
<dt><a href="#Stage">Stage</a> : <code>object</code></dt>
<dd><p>A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on</p>
</dd>
</dl>

<a name="Dependency"></a>

## Dependency : <code>container</code>
A dependency container

**Kind**: global container  
**See**: https://github.com/zacharygriffee/simplified-awilix  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | A unique id of the dependency. This changes every new dependency. You can change this and any other property by defining resolver [Stage.addDependency](Stage.addDependency) |
| name | <code>string</code> |  | The name of the dependency. |
| container | <code>container</code> |  | the [awilix container](https://github.com/zacharygriffee/simplified-awilix) of this dependency |
| [optional] | <code>boolean</code> | <code>false</code> | Whether this dependency is optional. THis is a temporary property as I plan on flushing the 'optional' 'features' 'extensions' out a bit more. |
| module | <code>object</code> |  | When installed, module will be the installed module. |
| [code] | <code>string</code> |  | The code of a module. When the dependency is installed, the code will be transformed into a data uri, imported, and validated. |
| [uri] | <code>string</code> |  | A data uri of a module. |
| [npmSpecifier] | <code>string</code> |  | A bare specifier. The specifier should work on both node and the browser resolver defined at [Stage.npmCdnResolver](Stage.npmCdnResolver) and [Dependency.npmCdnResolver](Dependency.npmCdnResolver) |
| [exports] | <code>array.&lt;string&gt;</code> |  | Export these export names from the module. If empty, will export all. |
| valid | <code>boolean</code> |  | If this dependency succeeded it's validator. Validation occurs at the dependency installation. Otherwise, this will be false. If this dependency is installed with validationRequired=false either by stage.install, stage.installDependency, or dependency.install, this will be false. |


* [Dependency](#Dependency) : <code>container</code>
    * [.npmCdnResolver](#Dependency+npmCdnResolver)
    * [.install](#Dependency+install) ⇒
    * [.isSerializable](#Dependency+isSerializable) ⇒ <code>boolean</code> \| <code>undefined</code>
    * [.snapshot](#Dependency+snapshot)
    * [.dispose](#Dependency+dispose)
    * [.validator](#Dependency+validator) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="Dependency+npmCdnResolver"></a>

### dependency.npmCdnResolver
Define how an npmSpecifier is resolved at the dependency level. This will override Stage.npmCdnResolver.

**Kind**: instance method of [<code>Dependency</code>](#Dependency)  
<a name="Dependency+install"></a>

### dependency.install ⇒
Install the single dependency without it becoming a dependency to a stage. This is also used by
[Stage.install](Stage.install) to install dependencies to itself.

The process of the installation goes like this:

- Check if module is defined, if so, this will take precedence over all other below.
- if Dependency.npmSpecifier && node: will check if the npmSpecifier can be imported via node_modules.
- if Dependency.npmSpecifier && browser: will utilize npmCdnResolver resolver to attempt to get the specifier from it.
- if Dependency.code: turn it into an uri and add to importSources
- if Dependency.uri (application/javascript): add to importSources
- Then if any other importSources were added, they will be attempted after this.

The importSources should strive to be as environmentally agnostic and serializable possible. Or at least have
a importSource for the environments the dependencies should support.

**Kind**: instance method of [<code>Dependency</code>](#Dependency)  
**Returns**: Dependency  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>true</code> | If true, this dependency must have a validator that has checked the integrity of the dependency. You can override this and test the dependency in your own way |

**Example**  
```js
// Overriding dependency validation with your own resolvers
dependency.container.register({validator(module) { return !!module.followsTheRules; } });
// Note: There should many mechanisms at play to ensure that the dependency is safe to run
// beyond the validator.
```
<a name="Dependency+isSerializable"></a>

### dependency.isSerializable ⇒ <code>boolean</code> \| <code>undefined</code>
Whether the dependency is serializable. For now, it checks if code or uri exists and whether it
can be serialized judged by structuredClone algorithm.
Because the resolvers for code and uri does not necessarily have to be serializable.
This checker requires that code or uri is declared on the container, if not, it will return undefined rather than
false

**Kind**: instance property of [<code>Dependency</code>](#Dependency)  
**Returns**: <code>boolean</code> \| <code>undefined</code> - true or falsy  
<a name="Dependency+snapshot"></a>

### dependency.snapshot
Create a serializable javascript object of the dependency if the dependency is serializable, see
[Dependency.isSerializable](Dependency.isSerializable) Snapshots can be added back into stage.addDependency which allows you to save the
state of the stage and reload it, or transfer the state of the stage over network.

**Kind**: instance method of [<code>Dependency</code>](#Dependency)  
<a name="Dependency+dispose"></a>

### dependency.dispose
Clear cached values of this dependency and reset it to pre-installation state. This will impact all
stages that have this dependency.

**Kind**: instance property of [<code>Dependency</code>](#Dependency)  
**Kindof**: method  
<a name="Dependency+validator"></a>

### dependency.validator ⇒ <code>Promise.&lt;boolean&gt;</code>
The validator function or string is coerced into a string, and all registered
properties and functions of this (Dependency) container will be its global context. It must return true, false, or throw.
If it returns false or throws, the installation will fail for this dependency and if it is a non-optional dependency with
no other sources (currently a wip), it will fail the stage installation. If you require multiple lines in a string based validator, surround
the validator with curly braces and utilize a return statement e.g. <pre>validator: "{ if (module.isBad) { return false }; return true }"</pre>

All the other properties of this container (i.e. code, uri, exports, container, etc) will be available EXCEPT the validator function and valid result.

**Kind**: instance property of [<code>Dependency</code>](#Dependency)  
**Example**  
```js
// How to apply a validator to a dependency.
dependency.container.register({
    validator: "module.isCorrect === true"
});
stage.addDependency({
    name: "someModule",
    code: "export default 'some module stuff'",
    validator: "module === 'some module stuff'"
});
```
<a name="Stage"></a>

## Stage : [<code>Container</code>](#Container)
A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on
the dependencies.

**Kind**: global container  
**See**: https://github.com/zacharygriffee/simplified-awilix  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | A unique id of the stage. This changes every new application. |
| rootId | <code>string</code> |  | The id of the stage that is the root of this stage. e.g. the master stage. |
| container | [<code>Container</code>](#Container) |  | the [awilix container](https://github.com/zacharygriffee/simplified-awilix) of this stage |
| depth | <code>number</code> |  | Fork depth of this stage. |
| forks | <code>array</code> |  | All forks of this stage. |
| dependencies | <code>object</code> |  | An object of dependencies installed to this stage. Installed dependencies will be propagated into any forked stages. |
| [requireDependencyValidation] | <code>boolean</code> | <code>true</code> | Whether this stage will require dependency validations |


* [Stage](#Stage) : [<code>Container</code>](#Container)
    * [.fork](#Stage+fork)
    * [.isSerializable](#Stage+isSerializable) ⇒ <code>boolean</code> \| <code>undefined</code>
    * [.merge](#Stage+merge)
    * [.snapshot](#Stage+snapshot) ⇒ <code>object</code>
    * [.npmCdnResolver](#Stage+npmCdnResolver)
    * [.dispose](#Stage+dispose) ⇒
    * [.addDependency](#Stage+addDependency)
    * [.getDependency](#Stage+getDependency)
    * [.install([validationRequired])](#Stage+install) ⇒ <code>function</code>
    * [.installDependency(name, [validationRequired])](#Stage+installDependency)

<a name="Stage+fork"></a>

### stage.fork
Create a forked stage of this one. It will attain the dependencies of the parent stage,
and any new dependencies added and installed on the parent stage will be added to the forked stage automatically.
Disposing a fork will only remove the cached values and dependencies of itself, and dependencies it used will not
be disposed if other stages are using it.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
<a name="Stage+isSerializable"></a>

### stage.isSerializable ⇒ <code>boolean</code> \| <code>undefined</code>
Whether ALL direct dependencies of the stage (not forks) is serializable and a snapshot can be created from it.
See [Stage.snapshot](Stage.snapshot) and [Dependency.isSerializable](Dependency.isSerializable)

**Kind**: instance property of [<code>Stage</code>](#Stage)  
**Returns**: <code>boolean</code> \| <code>undefined</code> - true or falsy  
<a name="Stage+merge"></a>

### stage.merge
Merge another stage into this one. All dependencies installed in the other stage,
will become installed in this stage. Another stage being disposed will not dispose the dependencies in this stage.

**Kind**: instance method of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| container | [<code>Stage</code>](#Stage) | the other stage to merge into this stage. |

<a name="Stage+snapshot"></a>

### stage.snapshot ⇒ <code>object</code>
Create snapshot of the dependencies the stage directly handles (not forks). You can rehydrate the
stage's snapshot in the 'stage.fork' function. Currently and it is not planned to cannot create an `alien stage`
from a snapshot.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
<a name="Stage+npmCdnResolver"></a>

### stage.npmCdnResolver
Define how an npmSpecifier is resolved if being resolved from a browser or environment that supports
module import from url. This will apply to all dependencies of this stage.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
<a name="Stage+dispose"></a>

### stage.dispose ⇒
An alias function for the container's dispose function.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
**Returns**: Promise<void>  
<a name="Stage+addDependency"></a>

### stage.addDependency
Add a dependency to be ready for installation.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [dependencyInterface] |  | The dependency structure, see Dependency container. You may also supply an array of dependency structures for multiple dependencies. |
| [dependencyInterface.reinstall] | <code>false</code> | If the dependency is already installed, this will cause the dependency to reinstall itself if set to true. |

<a name="Stage+getDependency"></a>

### stage.getDependency
Get a dependency that was added via addDependency whether installed or not.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> |  | The name of the dependency. If array of strings, will get each dependency in the list, and  return the list of dependencies in that order. |
| [asContainer] | <code>boolean</code> | <code>false</code> | Return the dependency as a container instead of its proxy cradle. |

<a name="Stage+install"></a>

### stage.install([validationRequired]) ⇒ <code>function</code>
Install all dependencies that have not yet been installed. This returns the resolved dependencies.

This should almost be error handled / caught as most dependency installation errors will be brought up here.
If an installation fails without being caught, it will hang the process (browser/node) without notice for
security purposes.

<pre>
Error potentials:
 MultipleErrors
 DependencyError,
 InstallationError,                  // If installation fails because a non-optional dependency failed to install
     - DependencyCouldNotBeInstalled,// A non-optional dependency failed to install
     - DependencyCouldNotBeValidated,// A non-optional dependency failed its validation.
</pre>

**Kind**: instance method of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>Dependency.requireDependencyValidation</code> | Validation required for all dependencies installed. |

<a name="Stage+installDependency"></a>

### stage.installDependency(name, [validationRequired])
Install a single dependency

**Kind**: instance method of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the dependency used when adding it via Stage.addDependency |
| [validationRequired] |  | <code>true</code> | If true, all dependencies must have a validator that checks integrity |

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
<a name="Dependency"></a>

## Dependency : <code>object</code>
A Container that resolves and contains dependency.

**Kind**: global namespace  

* [Dependency](#Dependency) : <code>object</code>
    * [.npmCdnResolver](#Dependency+npmCdnResolver)
    * [.install](#Dependency+install) ⇒
    * [.isSerializable](#Dependency+isSerializable) ⇒ <code>boolean</code> \| <code>undefined</code>
    * [.snapshot](#Dependency+snapshot)
    * [.dispose](#Dependency+dispose)
    * [.validator](#Dependency+validator) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="Dependency+npmCdnResolver"></a>

### dependency.npmCdnResolver
Define how an npmSpecifier is resolved at the dependency level. This will override Stage.npmCdnResolver.

**Kind**: instance method of [<code>Dependency</code>](#Dependency)  
<a name="Dependency+install"></a>

### dependency.install ⇒
Install the single dependency without it becoming a dependency to a stage. This is also used by
[Stage.install](Stage.install) to install dependencies to itself.

The process of the installation goes like this:

- Check if module is defined, if so, this will take precedence over all other below.
- if Dependency.npmSpecifier && node: will check if the npmSpecifier can be imported via node_modules.
- if Dependency.npmSpecifier && browser: will utilize npmCdnResolver resolver to attempt to get the specifier from it.
- if Dependency.code: turn it into an uri and add to importSources
- if Dependency.uri (application/javascript): add to importSources
- Then if any other importSources were added, they will be attempted after this.

The importSources should strive to be as environmentally agnostic and serializable possible. Or at least have
a importSource for the environments the dependencies should support.

**Kind**: instance method of [<code>Dependency</code>](#Dependency)  
**Returns**: Dependency  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>true</code> | If true, this dependency must have a validator that has checked the integrity of the dependency. You can override this and test the dependency in your own way |

**Example**  
```js
// Overriding dependency validation with your own resolvers
dependency.container.register({validator(module) { return !!module.followsTheRules; } });
// Note: There should many mechanisms at play to ensure that the dependency is safe to run
// beyond the validator.
```
<a name="Dependency+isSerializable"></a>

### dependency.isSerializable ⇒ <code>boolean</code> \| <code>undefined</code>
Whether the dependency is serializable. For now, it checks if code or uri exists and whether it
can be serialized judged by structuredClone algorithm.
Because the resolvers for code and uri does not necessarily have to be serializable.
This checker requires that code or uri is declared on the container, if not, it will return undefined rather than
false

**Kind**: instance property of [<code>Dependency</code>](#Dependency)  
**Returns**: <code>boolean</code> \| <code>undefined</code> - true or falsy  
<a name="Dependency+snapshot"></a>

### dependency.snapshot
Create a serializable javascript object of the dependency if the dependency is serializable, see
[Dependency.isSerializable](Dependency.isSerializable) Snapshots can be added back into stage.addDependency which allows you to save the
state of the stage and reload it, or transfer the state of the stage over network.

**Kind**: instance method of [<code>Dependency</code>](#Dependency)  
<a name="Dependency+dispose"></a>

### dependency.dispose
Clear cached values of this dependency and reset it to pre-installation state. This will impact all
stages that have this dependency.

**Kind**: instance property of [<code>Dependency</code>](#Dependency)  
**Kindof**: method  
<a name="Dependency+validator"></a>

### dependency.validator ⇒ <code>Promise.&lt;boolean&gt;</code>
The validator function or string is coerced into a string, and all registered
properties and functions of this (Dependency) container will be its global context. It must return true, false, or throw.
If it returns false or throws, the installation will fail for this dependency and if it is a non-optional dependency with
no other sources (currently a wip), it will fail the stage installation. If you require multiple lines in a string based validator, surround
the validator with curly braces and utilize a return statement e.g. <pre>validator: "{ if (module.isBad) { return false }; return true }"</pre>

All the other properties of this container (i.e. code, uri, exports, container, etc) will be available EXCEPT the validator function and valid result.

**Kind**: instance property of [<code>Dependency</code>](#Dependency)  
**Example**  
```js
// How to apply a validator to a dependency.
dependency.container.register({
    validator: "module.isCorrect === true"
});
stage.addDependency({
    name: "someModule",
    code: "export default 'some module stuff'",
    validator: "module === 'some module stuff'"
});
```
<a name="Stage"></a>

## Stage : <code>object</code>
A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on

**Kind**: global namespace  

* [Stage](#Stage) : <code>object</code>
    * [.fork](#Stage+fork)
    * [.isSerializable](#Stage+isSerializable) ⇒ <code>boolean</code> \| <code>undefined</code>
    * [.merge](#Stage+merge)
    * [.snapshot](#Stage+snapshot) ⇒ <code>object</code>
    * [.npmCdnResolver](#Stage+npmCdnResolver)
    * [.dispose](#Stage+dispose) ⇒
    * [.addDependency](#Stage+addDependency)
    * [.getDependency](#Stage+getDependency)
    * [.install([validationRequired])](#Stage+install) ⇒ <code>function</code>
    * [.installDependency(name, [validationRequired])](#Stage+installDependency)

<a name="Stage+fork"></a>

### stage.fork
Create a forked stage of this one. It will attain the dependencies of the parent stage,
and any new dependencies added and installed on the parent stage will be added to the forked stage automatically.
Disposing a fork will only remove the cached values and dependencies of itself, and dependencies it used will not
be disposed if other stages are using it.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
<a name="Stage+isSerializable"></a>

### stage.isSerializable ⇒ <code>boolean</code> \| <code>undefined</code>
Whether ALL direct dependencies of the stage (not forks) is serializable and a snapshot can be created from it.
See [Stage.snapshot](Stage.snapshot) and [Dependency.isSerializable](Dependency.isSerializable)

**Kind**: instance property of [<code>Stage</code>](#Stage)  
**Returns**: <code>boolean</code> \| <code>undefined</code> - true or falsy  
<a name="Stage+merge"></a>

### stage.merge
Merge another stage into this one. All dependencies installed in the other stage,
will become installed in this stage. Another stage being disposed will not dispose the dependencies in this stage.

**Kind**: instance method of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| container | [<code>Stage</code>](#Stage) | the other stage to merge into this stage. |

<a name="Stage+snapshot"></a>

### stage.snapshot ⇒ <code>object</code>
Create snapshot of the dependencies the stage directly handles (not forks). You can rehydrate the
stage's snapshot in the 'stage.fork' function. Currently and it is not planned to cannot create an `alien stage`
from a snapshot.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
<a name="Stage+npmCdnResolver"></a>

### stage.npmCdnResolver
Define how an npmSpecifier is resolved if being resolved from a browser or environment that supports
module import from url. This will apply to all dependencies of this stage.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
<a name="Stage+dispose"></a>

### stage.dispose ⇒
An alias function for the container's dispose function.

**Kind**: instance method of [<code>Stage</code>](#Stage)  
**Returns**: Promise<void>  
<a name="Stage+addDependency"></a>

### stage.addDependency
Add a dependency to be ready for installation.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [dependencyInterface] |  | The dependency structure, see Dependency container. You may also supply an array of dependency structures for multiple dependencies. |
| [dependencyInterface.reinstall] | <code>false</code> | If the dependency is already installed, this will cause the dependency to reinstall itself if set to true. |

<a name="Stage+getDependency"></a>

### stage.getDependency
Get a dependency that was added via addDependency whether installed or not.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> |  | The name of the dependency. If array of strings, will get each dependency in the list, and  return the list of dependencies in that order. |
| [asContainer] | <code>boolean</code> | <code>false</code> | Return the dependency as a container instead of its proxy cradle. |

<a name="Stage+install"></a>

### stage.install([validationRequired]) ⇒ <code>function</code>
Install all dependencies that have not yet been installed. This returns the resolved dependencies.

This should almost be error handled / caught as most dependency installation errors will be brought up here.
If an installation fails without being caught, it will hang the process (browser/node) without notice for
security purposes.

<pre>
Error potentials:
 MultipleErrors
 DependencyError,
 InstallationError,                  // If installation fails because a non-optional dependency failed to install
     - DependencyCouldNotBeInstalled,// A non-optional dependency failed to install
     - DependencyCouldNotBeValidated,// A non-optional dependency failed its validation.
</pre>

**Kind**: instance method of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>Dependency.requireDependencyValidation</code> | Validation required for all dependencies installed. |

<a name="Stage+installDependency"></a>

### stage.installDependency(name, [validationRequired])
Install a single dependency

**Kind**: instance method of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the dependency used when adding it via Stage.addDependency |
| [validationRequired] |  | <code>true</code> | If true, all dependencies must have a validator that checks integrity |

