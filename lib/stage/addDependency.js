import {DependencyCouldNotBeAdded} from "../errors.js";
import * as gsh from "../util/get-set-has.js";
import {dependencyContainer} from "../dependency/dependencyContainer.js";
import {nanoid} from "../util/nanoid-non-secure.js";

/**
 * @name addDependency
 * @instance
 * @description Add a dependency to be ready for installation.
 * @param [dependencyInterface] The
 * @param [dependencyInterface.reinstall=false] If the dependency is already installed, this will cause the
 * dependency to reinstall itself if set to true.
 * @memberOf Stage
 */
export function addDependency({dependencies, container, forks}) {
    return (dependencyInterface = {}) => {
        if (typeof dependencyInterface === "string") dependencyInterface = {name: dependencyInterface};
        const {
            name,
            reinstall = false,
            validator,
            ...rest
        } = dependencyInterface;
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

        _dependencyContainer.registerScoped({
            id: nanoid(),
            container: _dependencyContainer,
            stage: container,
            name,
            ...rest
        }).registerTransient({validator});

        gsh.set(dependencies, name, _dependencyContainer);

        for (const fork of forks) {
            fork.dependencies[name] ||= _dependencyContainer
        }

        return _dependencyContainer.cradle
    }
}