
# DEPENDENCY API

## Objects

<dl>
<dt><a href="#Dependency">Dependency</a> : <code>object</code></dt>
<dd><p>A Container that resolves and contains dependency.</p>
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
| id | <code>string</code> |  | A unique id of the dependency. This changes every new dependency. You can change this and any other property by defining resolver [Stage.put](Stage.put) |
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
- if Dependency.npmSpecifier && browser will check importMap if it includes this specifier,
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
[Dependency.isSerializable](Dependency.isSerializable) Snapshots can be added back into stage.put which allows you to save the
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
stage.put({
    name: "someModule",
    code: "export default 'some module stuff'",
    validator: "module === 'some module stuff'"
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
- if Dependency.npmSpecifier && browser will check importMap if it includes this specifier,
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
[Dependency.isSerializable](Dependency.isSerializable) Snapshots can be added back into stage.put which allows you to save the
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
stage.put({
    name: "someModule",
    code: "export default 'some module stuff'",
    validator: "module === 'some module stuff'"
});
```
