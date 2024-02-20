import {DependencyCouldNotBeAdded} from "../errors.js";
import * as gsh from "../util/get-set-has.js";
import {dependencyContainer} from "../dependency/dependencyContainer.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {parseValidatorToString} from "../util/parseValidatorToString.js";

/**
 * @name put
 * @instance
 * @description Put a dependency to be ready for installation.
 * @param [_name] Name of the dependency or just pass the dependency structure here with name part of the interface.
 * @param [dependency] The dependency structure, see Dependency container. You may also supply an array of
 * dependency structures for multiple dependencies.
 * @param [config] Configuration for the put operation
 * @param [config.reinstall=false] If the dependency is already installed, this will cause the
 * dependency to reinstall itself if set to true.
 * @memberOf Stage
 */
export function put({id, dependencies, container, forks, npmCdnResolver}) {
    const retFunc = (_name, dependency = {}, config = {}) => {
        const {reinstall = false} = config;
        if (Array.isArray(dependency)) return dependency.map(retFunc);
        if (typeof _name !== "string") dependency = {...dependency, ..._name};
        let {
            name = _name,
            validator,
            ...rest
        } = dependency;

        if (!name) {
            throw new DependencyCouldNotBeAdded("Name not defined", "name of dependency was not defined")
        }
        let _dependencyContainer;
        if (gsh.has(dependencies, name) && !reinstall) {
            const currentDependency = gsh.get(dependencies, name);
            const {installed} = currentDependency.cradle;
            if (installed) {
                throw new DependencyCouldNotBeAdded(name, "dependency already installed.")
            } else {
                _dependencyContainer = currentDependency;
            }
        } else {
            _dependencyContainer = dependencyContainer.createScope();
        }

        const __ret = parseValidatorToString(id, validator);
        validator = __ret.validator;
        let valid = __ret.valid;

        _dependencyContainer.registerScoped({
            id: nanoid(),
            container: _dependencyContainer,
            stage: container,
            name,
            npmCdnResolver: () => npmCdnResolver,
            ...rest
        }).registerTransient({validator, valid});

        gsh.set(dependencies, name, _dependencyContainer);

        for (const fork of forks) {
            fork.dependencies[name] ||= _dependencyContainer
        }

        return _dependencyContainer.cradle
    }
    return retFunc;
}