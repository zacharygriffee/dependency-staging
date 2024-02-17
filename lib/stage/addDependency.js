import {DependencyCouldNotBeAdded} from "../errors.js";
import * as gsh from "../util/get-set-has.js";
import {dependencyContainer} from "../dependency/dependencyContainer.js";
import {nanoid} from "../util/nanoid-non-secure.js";

export function addDependency({dependencies, container, scopes}) {
    return (config = {}) => {
        if (typeof config === "string") config = {name: config};
        const {
            name,
            reinstall = false,
            validator,
            ...rest
        } = config;
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

        for (const x of scopes) {
            x.dependencies[name] ||= _dependencyContainer
        }

        return _dependencyContainer.cradle
    }
}