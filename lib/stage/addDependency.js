import {DependencyCouldNotBeAdded} from "../errors.js";
import * as gsh from "../util/get-set-has.js";
import {dependencyContainer} from "../dependency/dependencyContainer.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {importCode} from "../util/importCode.js";

export function parseValidatorToString(id, validator) {
    if (typeof validator === "function") {
        let validatorString = validator + "";
        if (validatorString.startsWith("validator")) {
            validatorString = validatorString.replace("validator", "function")
        }
        validator = `(${validatorString})(arguments[0])`;
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
    return {validator, valid};
}

/**
 * @name addDependency
 * @instance
 * @description Add a dependency to be ready for installation.
 * @param [dependencyInterface] The dependency structure, see Dependency container. You may also supply an array of
 * dependency structures for multiple dependencies.
 * @param [dependencyInterface.reinstall=false] If the dependency is already installed, this will cause the
 * dependency to reinstall itself if set to true.
 * @memberOf Stage
 */
export function addDependency({id, dependencies, container, forks, npmCdnResolver}) {
    const retFunc = (dependencyInterface = {}) => {
        if (Array.isArray(dependencyInterface)) return dependencyInterface.map(retFunc);
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