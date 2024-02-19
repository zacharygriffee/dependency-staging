import {DependencyCouldNotBeAdded} from "../errors.js";
import * as gsh from "../util/get-set-has.js";
import {dependencyContainer} from "../dependency/dependencyContainer.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {importCode} from "../util/importCode.js";

/**
 * @name addDependency
 * @instance
 * @description Add a dependency to be ready for installation.
 * @param [dependencyInterface] The
 * @param [dependencyInterface.reinstall=false] If the dependency is already installed, this will cause the
 * dependency to reinstall itself if set to true.
 * @memberOf Stage
 */
export function addDependency({id, dependencies, container, forks}) {
    return (dependencyInterface = {}) => {
        if (typeof dependencyInterface === "string") dependencyInterface = {name: dependencyInterface};
        let {
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

        if (typeof validator === "function") {
            validator = `(${validator})(arguments[0])`;
        }

        let valid;
        const tag = `/*${id}*/`;
        if (typeof validator === "string" && !validator.includes(tag)) {
            const _validator = validator;
            valid = async (cradle) => {
                const keys = Object.keys(cradle).filter(o => o !== "validator" && o !== "valid").join(",");
                const _validatorCode = `${tag}export default function ({${keys}}) { return () => ${_validator}; }`;
                let validatorResult = await Promise.resolve(
                    (await importCode(_validatorCode))?.default(cradle)
                );
                if (typeof validatorResult === "function") {
                    validatorResult = await validatorResult(cradle);
                }
                return validatorResult;
            };
        } else {
            valid = false;
        }

        _dependencyContainer.registerScoped({
            id: nanoid(),
            container: _dependencyContainer,
            stage: container,
            name,
            ...rest
        }).registerTransient({validator, valid});

        gsh.set(dependencies, name, _dependencyContainer);

        for (const fork of forks) {
            fork.dependencies[name] ||= _dependencyContainer
        }

        return _dependencyContainer.cradle
    }
}