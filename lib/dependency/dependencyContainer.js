import {createContainer} from "../installAwilix.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {installDependency} from "./installDependency.js";


/**
 * @namespace Dependency
 * @description A Container that resolves and contains dependency.
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
 * @property {array<string>} [exports] Export these export names from the module. If empty, will export all.
 * @property {function} validator Validation of the dependency.
 * @type {container}
 */
const dependencyContainer =
    createContainer()
        .registerScoped({
            id: () => nanoid(),
            installed: false,
            name: "",
            container: () => undefined,
            optional: false,
            code: undefined,
            uri: undefined,
            module: undefined,
            install: installDependency,
            exports: [],
            async validator(module) {
                return !!module
            },
            dispose: ({container}) => () => container.dispose()
        });

export {dependencyContainer};