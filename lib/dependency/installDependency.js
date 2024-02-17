import {importCode} from "../util/importCode.js";
import {DependencyCouldNotBeInstalled, DependencyCouldNotBeResolved, DependencyCouldNotBeValidated} from "../errors.js";

/**
 * @name install
 * @description Install the single dependency without it becoming a dependency to a stage.
 * @kind method
 * @param [validationRequired=true] If true, this dependency must have a validator that has checked the integrity of the
 * dependency. You can override this and test the dependency in your own way
 * @example // Overriding dependency validation with your own resolvers
 * dependency.register({validator(module) { return !!module.followsTheRules; } });
 * // Note: There should many mechanisms at play to ensure that the dependency is safe to run
 * // beyond the validator.
 * @memberOf Dependency
 * @returns Dependency
 */
function installDependency(cradle) {
    return async (validationRequired = true) => {
        const {validator, container, name, module, code, uri, optional, exports} = cradle;
        try {
            let installedModule;
            if (module) {
                installedModule = module;
            } else if (code) {
                const modules = await importCode(code);
                const moduleKeys = Object.keys(modules);
                if (exports && exports.length) {
                    installedModule = Object.entries(modules).reduce(
                        (acc, [exportName, exportValue]) => {
                            if (exports.includes(exportName)) {
                                acc[exportName] = exportValue;
                            }
                            return acc;
                        }
                    );
                } else if (moduleKeys.length === 1 && moduleKeys.includes("default")) {
                    installedModule = modules.default;
                } else {
                    installedModule = modules;
                }
            } else if (uri) {
                installedModule = await import(uri);
            }

            if (installedModule != null) {
                installedModule = await Promise.resolve(
                    installedModule
                );
            }

            if (validationRequired) {
                if (!await Promise.resolve(validator).catch(
                    e => {
                        throw new DependencyCouldNotBeValidated(name, e);
                    }
                )) {
                    throw new DependencyCouldNotBeValidated(name);
                }
            }

            if (installedModule) {
                return container.registerScoped({
                    module: installedModule,
                    installed: true
                }).cradle;
            }
        } catch (e) {
            if (!optional) {
                throw new DependencyCouldNotBeInstalled(name, e);
            }
        }
        if (!optional) {
            throw new DependencyCouldNotBeResolved(name);
        }
    }
}

export {installDependency};