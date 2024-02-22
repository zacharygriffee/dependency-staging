
# STAGE API

## Objects

<dl>
<dt><a href="#Stage">Stage</a> : <code>object</code></dt>
<dd><p>A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on</p>
</dd>
</dl>

<a name="Stage"></a>

## Stage : <code>Container</code>
A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on
the dependencies.

**Kind**: global container  
**See**: https://github.com/zacharygriffee/simplified-awilix  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | A unique id of the stage. This changes every new application. |
| rootId | <code>string</code> |  | The id of the stage that is the root of this stage. e.g. the master stage. |
| container | <code>Container</code> |  | the [awilix container](https://github.com/zacharygriffee/simplified-awilix) of this stage |
| depth | <code>number</code> |  | Fork depth of this stage. |
| forks | <code>array</code> |  | All forks of this stage. |
| dependencies | <code>object</code> |  | An object of dependencies installed to this stage. Installed dependencies will be propagated into any forked stages. |
| [requireDependencyValidation] | <code>boolean</code> | <code>true</code> | Whether this stage will require dependency validations |


* [Stage](#Stage) : <code>Container</code>
    * [.fork](#Stage+fork)
    * [.isSerializable](#Stage+isSerializable) ⇒ <code>boolean</code> \| <code>undefined</code>
    * [.merge](#Stage+merge)
    * [.snapshot](#Stage+snapshot) ⇒ <code>object</code>
    * [.npmCdnResolver](#Stage+npmCdnResolver)
    * [.dispose](#Stage+dispose) ⇒
    * [.Execute](#Stage+Execute)
    * [.exists](#Stage+exists)
    * [.get](#Stage+get)
    * [.ifExists](#Stage+ifExists)
    * [.put](#Stage+put)
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
<a name="Stage+Execute"></a>

### stage.Execute
Get a dependency's module that has already been validated and installed.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> | The name of the dependency. If array of strings, will return the module of each dependency. If the dependency is not installed, this function will throw DependencyIsNotInstalled error. |

<a name="Stage+exists"></a>

### stage.exists
Check if a dependency exists.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| dependency | <code>string</code> \| <code>array.&lt;string&gt;</code> | The name of the dependency. If array of strings, will check each dependency in the list whether it exists |

<a name="Stage+get"></a>

### stage.get
Get a dependency that was added via Stage.put whether installed or not.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> |  | The name of the dependency. If array of strings, will get each dependency in the list, and  return the list of dependencies in that order. |
| [asContainer] | <code>boolean</code> | <code>false</code> | Return the dependency as a container instead of its proxy cradle. |

<a name="Stage+ifExists"></a>

### stage.ifExists
If a dependency or dependencies exists, the callback will be called.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> | An array or string of dependencies to call the callback with if they all exist. |
| cb | <code>function</code> | The first argument of the callback will be the cradle of the dependency, and the second argument will be the stage's cradle. |

<a name="Stage+put"></a>

### stage.put
Put a dependency to be ready for installation.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [_name] |  | Name of the dependency or just pass the dependency structure here with name part of the interface. |
| [dependency] |  | The dependency structure, see Dependency container. You may also supply an array of dependency structures for multiple dependencies. |
| [config] |  | Configuration for the put operation |
| [config.reinstall] | <code>false</code> | If the dependency is already installed, this will cause the dependency to reinstall itself if set to true. |

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
| name | <code>string</code> |  | The name of the dependency used when adding it via Stage.put |
| [validationRequired] |  | <code>true</code> | If true, all dependencies must have a validator that checks integrity |

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
    * [.Execute](#Stage+Execute)
    * [.exists](#Stage+exists)
    * [.get](#Stage+get)
    * [.ifExists](#Stage+ifExists)
    * [.put](#Stage+put)
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
<a name="Stage+Execute"></a>

### stage.Execute
Get a dependency's module that has already been validated and installed.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> | The name of the dependency. If array of strings, will return the module of each dependency. If the dependency is not installed, this function will throw DependencyIsNotInstalled error. |

<a name="Stage+exists"></a>

### stage.exists
Check if a dependency exists.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| dependency | <code>string</code> \| <code>array.&lt;string&gt;</code> | The name of the dependency. If array of strings, will check each dependency in the list whether it exists |

<a name="Stage+get"></a>

### stage.get
Get a dependency that was added via Stage.put whether installed or not.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> |  | The name of the dependency. If array of strings, will get each dependency in the list, and  return the list of dependencies in that order. |
| [asContainer] | <code>boolean</code> | <code>false</code> | Return the dependency as a container instead of its proxy cradle. |

<a name="Stage+ifExists"></a>

### stage.ifExists
If a dependency or dependencies exists, the callback will be called.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| <code>array.&lt;string&gt;</code> | An array or string of dependencies to call the callback with if they all exist. |
| cb | <code>function</code> | The first argument of the callback will be the cradle of the dependency, and the second argument will be the stage's cradle. |

<a name="Stage+put"></a>

### stage.put
Put a dependency to be ready for installation.

**Kind**: instance property of [<code>Stage</code>](#Stage)  

| Param | Default | Description |
| --- | --- | --- |
| [_name] |  | Name of the dependency or just pass the dependency structure here with name part of the interface. |
| [dependency] |  | The dependency structure, see Dependency container. You may also supply an array of dependency structures for multiple dependencies. |
| [config] |  | Configuration for the put operation |
| [config.reinstall] | <code>false</code> | If the dependency is already installed, this will cause the dependency to reinstall itself if set to true. |

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
| name | <code>string</code> |  | The name of the dependency used when adding it via Stage.put |
| [validationRequired] |  | <code>true</code> | If true, all dependencies must have a validator that checks integrity |

