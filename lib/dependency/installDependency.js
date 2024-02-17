import {identity} from "../util/identity.js";
import {importCode} from "../util/importCode.js";
import {DependencyCouldNotBeInstalled, DependencyCouldNotBeResolved, DependencyCouldNotBeValidated} from "../errors.js";

export function installDependency(cradle) {
    return async (refinement = identity, validationRequired = true) => {
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
                    refinement(installedModule)
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