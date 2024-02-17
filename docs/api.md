
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
| id | <code>string</code> |  | A unique id of the stage. This changes every new application. |
| name | <code>string</code> |  | The name of the dependency. |
| container | <code>container</code> |  | the [awilix container](https://github.com/zacharygriffee/simplified-awilix) of this dependency |
| [optional] | <code>boolean</code> | <code>false</code> | Whether this dependency is optional. THis is a temporary property as I plan on flushing the 'optional' 'features' 'extensions' out a bit more. |
| module | <code>object</code> |  | When installed, module will be the installed module. |
| [code] | <code>string</code> |  | The code of a module. When the dependency is installed, the code will be transformed into a data uri, imported, and validated. |
| [uri] | <code>string</code> |  | A data uri of a module. |
| [exports] | <code>array.&lt;string&gt;</code> |  | Export these export names from the module. If empty, will export all. |
| validator | <code>function</code> |  | Validation of the dependency. |


* [Dependency](#Dependency) : <code>container</code>
    * [.install](#Dependency.install) ⇒
    * [.dispose](#Dependency.dispose)

<a name="Dependency.install"></a>

### Dependency.install ⇒
Install the single dependency without it becoming a dependency to a stage.

**Kind**: static method of [<code>Dependency</code>](#Dependency)  
**Returns**: Dependency  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>true</code> | If true, this dependency must have a validator that has checked the integrity of the dependency. You can override this and test the dependency in your own way |

**Example**  
```js
// Overriding dependency validation with your own resolvers
dependency.register({validator(module) { return !!module.followsTheRules; } });
// Note: There should many mechanisms at play to ensure that the dependency is safe to run
// beyond the validator.
```
<a name="Dependency.dispose"></a>

### Dependency.dispose
Clear cached values of this dependency and reset it to pre-installation state. This will impact all
stages that have this dependency.

**Kind**: static property of [<code>Dependency</code>](#Dependency)  
**Kindof**: method  
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
    * [.fork](#Stage.fork)
    * [.merge](#Stage.merge)
    * [.dispose](#Stage.dispose) ⇒
    * [.addDependency](#Stage.addDependency)
    * [.install([validationRequired])](#Stage.install) ⇒ <code>function</code>
    * [.installDependency(name, [validationRequired])](#Stage.installDependency)

<a name="Stage.fork"></a>

### Stage.fork
Create a forked stage of this one. It will attain the dependencies of the parent stage,
and any new dependencies added and installed on the parent stage will be added to the forked stage automatically.
Disposing a fork will only remove the cached values and dependencies of itself, and dependencies it used will not
be disposed if other stages are using it.

**Kind**: static method of [<code>Stage</code>](#Stage)  
<a name="Stage.merge"></a>

### Stage.merge
Merge another stage into this one. All dependencies installed in the other stage,
will become installed in this stage. Another stage being disposed will not dispose the dependencies in this stage.

**Kind**: static method of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| container | [<code>Stage</code>](#Stage) | the other stage to merge into this stage. |

<a name="Stage.dispose"></a>

### Stage.dispose ⇒
An alias function for the container's dispose function.

**Kind**: static method of [<code>Stage</code>](#Stage)  
**Returns**: Promise<void>  
<a name="Stage.addDependency"></a>

### Stage.addDependency
Add a dependency to be ready for installation.

**Kind**: static property of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [dependencyInterface] |  | The |
| [dependencyInterface.reinstall] | <code>false</code> | If the dependency is already installed, this will cause the dependency to reinstall itself if set to true. |

<a name="Stage.install"></a>

### Stage.install([validationRequired]) ⇒ <code>function</code>
Install all dependencies that have not yet been installed. This returns an object with following signature:
<pre>
{
     failedCount,     // How many failed ( both optional and non-optional failures )
     failed,          // Whether the installation failed. Failed optional
                      // dependencies will not cause the installation to fail
     resolved,        // All resolved dependencies
     rejected         // All rejected dependencies
}
</pre>

**Kind**: static method of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>Dependency.requireDependencyValidation</code> | Validation required for all dependencies installed. |

<a name="Stage.installDependency"></a>

### Stage.installDependency(name, [validationRequired])
Install a single dependency

**Kind**: static method of [<code>Stage</code>](#Stage)  

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
    * [.install](#Dependency.install) ⇒
    * [.dispose](#Dependency.dispose)

<a name="Dependency.install"></a>

### Dependency.install ⇒
Install the single dependency without it becoming a dependency to a stage.

**Kind**: static method of [<code>Dependency</code>](#Dependency)  
**Returns**: Dependency  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>true</code> | If true, this dependency must have a validator that has checked the integrity of the dependency. You can override this and test the dependency in your own way |

**Example**  
```js
// Overriding dependency validation with your own resolvers
dependency.register({validator(module) { return !!module.followsTheRules; } });
// Note: There should many mechanisms at play to ensure that the dependency is safe to run
// beyond the validator.
```
<a name="Dependency.dispose"></a>

### Dependency.dispose
Clear cached values of this dependency and reset it to pre-installation state. This will impact all
stages that have this dependency.

**Kind**: static property of [<code>Dependency</code>](#Dependency)  
**Kindof**: method  
<a name="Stage"></a>

## Stage : <code>object</code>
A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on

**Kind**: global namespace  

* [Stage](#Stage) : <code>object</code>
    * [.fork](#Stage.fork)
    * [.merge](#Stage.merge)
    * [.dispose](#Stage.dispose) ⇒
    * [.addDependency](#Stage.addDependency)
    * [.install([validationRequired])](#Stage.install) ⇒ <code>function</code>
    * [.installDependency(name, [validationRequired])](#Stage.installDependency)

<a name="Stage.fork"></a>

### Stage.fork
Create a forked stage of this one. It will attain the dependencies of the parent stage,
and any new dependencies added and installed on the parent stage will be added to the forked stage automatically.
Disposing a fork will only remove the cached values and dependencies of itself, and dependencies it used will not
be disposed if other stages are using it.

**Kind**: static method of [<code>Stage</code>](#Stage)  
<a name="Stage.merge"></a>

### Stage.merge
Merge another stage into this one. All dependencies installed in the other stage,
will become installed in this stage. Another stage being disposed will not dispose the dependencies in this stage.

**Kind**: static method of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| container | [<code>Stage</code>](#Stage) | the other stage to merge into this stage. |

<a name="Stage.dispose"></a>

### Stage.dispose ⇒
An alias function for the container's dispose function.

**Kind**: static method of [<code>Stage</code>](#Stage)  
**Returns**: Promise<void>  
<a name="Stage.addDependency"></a>

### Stage.addDependency
Add a dependency to be ready for installation.

**Kind**: static property of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [dependencyInterface] |  | The |
| [dependencyInterface.reinstall] | <code>false</code> | If the dependency is already installed, this will cause the dependency to reinstall itself if set to true. |

<a name="Stage.install"></a>

### Stage.install([validationRequired]) ⇒ <code>function</code>
Install all dependencies that have not yet been installed. This returns an object with following signature:
<pre>
{
     failedCount,     // How many failed ( both optional and non-optional failures )
     failed,          // Whether the installation failed. Failed optional
                      // dependencies will not cause the installation to fail
     resolved,        // All resolved dependencies
     rejected         // All rejected dependencies
}
</pre>

**Kind**: static method of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [validationRequired] | <code>Dependency.requireDependencyValidation</code> | Validation required for all dependencies installed. |

<a name="Stage.installDependency"></a>

### Stage.installDependency(name, [validationRequired])
Install a single dependency

**Kind**: static method of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the dependency used when adding it via Stage.addDependency |
| [validationRequired] |  | <code>true</code> | If true, all dependencies must have a validator that checks integrity |

