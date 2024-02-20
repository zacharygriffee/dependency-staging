import {createContainer} from "../installAwilix.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {installDependency} from "./installDependency.js";
import {isSerializable} from "./isSerializable.js";
import {snapshot} from "./snapshot.js";


/**
 * @namespace Dependency
 * @description A Container that resolves and contains dependency.
 */

/**
 * @name npmCdnResolver
 * @description Define how an npmSpecifier is resolved at the dependency level. This will override Stage.npmCdnResolver.
 * @kind method
 * @memberOf Dependency
 * @instance
 */

/**
 * @name dispose
 * @instance
 * @description Clear cached values of this dependency and reset it to pre-installation state. This will impact all
 * stages that have this dependency.
 * @kindOf method
 * @memberOf Dependency
 */

/**
 * @name Dependency
 * @kind container
 * @description A dependency container
 * @see https://github.com/zacharygriffee/simplified-awilix
 * @property {string} id A unique id of the dependency. This changes every new dependency. You can change this and any other property by defining resolver {@link Stage.addDependency}
 * @property {string} name The name of the dependency.
 * @property {container} container the {@link https://github.com/zacharygriffee/simplified-awilix awilix container} of this dependency
 * @property {boolean} [optional=false] Whether this dependency is optional. THis is a temporary property as I plan on flushing the 'optional' 'features' 'extensions' out a bit more.
 * @property {object} module When installed, module will be the installed module.
 * @property {string} [code] The code of a module. When the dependency is installed, the code will be transformed into a data uri, imported, and validated.
 * @property {string} [uri] A data uri of a module.
 * @property {string} [npmSpecifier] A bare specifier. The specifier should work on both node and the browser resolver defined at {@link Stage.npmCdnResolver} and {@link Dependency.npmCdnResolver}
 * @property {array<string>} [exports] Export these export names from the module. If empty, will export all.
 * @property {boolean} valid If this dependency succeeded it's validator. Validation occurs at the dependency installation. Otherwise, this will be false. If this dependency is installed
 * with validationRequired=false either by stage.install, stage.installDependency, or dependency.install, this will be false.
 * @type {container}
 */
const dependencyContainer =
    createContainer()
        .registerScoped({
            id: () => nanoid(),
            installed: () => false,
            name: "",
            container: () => undefined,
            optional: false,
            importSources: () => ([]),
            code: undefined,
            uri: undefined,
            module: undefined,
            install: installDependency,
            exports: [],
            /**
             * @name validator
             * @description The validator function or string is coerced into a string, and all registered
             * properties and functions of this (Dependency) container will be its global context. It must return true, false, or throw.
             * If it returns false or throws, the installation will fail for this dependency and if it is a non-optional dependency with
             * no other sources (currently a wip), it will fail the stage installation. If you require multiple lines in a string based validator, surround
             * the validator with curly braces and utilize a return statement e.g. <pre>validator: "{ if (module.isBad) { return false }; return true }"</pre>
             *
             * All the other properties of this container (i.e. code, uri, exports, container, etc) will be available EXCEPT the validator function and valid result.
             *
             * @example // How to apply a validator to a dependency.
             * dependency.container.register({
             *     validator: "module.isCorrect === true"
             * });
             * stage.addDependency({
             *     name: "someModule",
             *     code: "export default 'some module stuff'",
             *     validator: "module === 'some module stuff'"
             * });
             * @memberOf Dependency
             * @instance
             * @returns {Promise<boolean>}
             */
            async validator(module) {
                return !!module
            },
            dispose: ({container}) => () => {
                container.registerScoped({
                    installed: false,
                    module: undefined
                });
                return container.dispose();
            }
        })
        .registerTransient({
            snapshot,
            isSerializable
        });

export {dependencyContainer};