import {DependencyCouldNotBeInstalled, DependencyCouldNotBeResolved, DependencyCouldNotBeValidated} from "../errors.js";
import {importCode} from "../util/importCode.js";

/**
 * @name install
 * @instance
 * @description Install the single dependency without it becoming a dependency to a stage.
 * @kind method
 * @param [validationRequired=true] If true, this dependency must have a validator that has checked the integrity of the
 * dependency. You can override this and test the dependency in your own way
 * @example // Overriding dependency validation with your own resolvers
 * dependency.container.register({validator(module) { return !!module.followsTheRules; } });
 * // Note: There should many mechanisms at play to ensure that the dependency is safe to run
 * // beyond the validator.
 * @memberOf Dependency
 * @returns Dependency
 */
function installDependency(cradle) {
    return async (validationRequired = true) => {
        const {
            container,
            name,
            module,
            code,
            uri,
            importSources,
            optional,
            exports,
            defaultAs,
            installed
        } = cradle;
        // try {
        if (installed) {
            throw new DependencyCouldNotBeInstalled(name, "Already installed.");
        }
        let resolvedModule = module;
        if (resolvedModule == null) {
            if (code)
                importSources.push(
                    importCode(code)
                );

            if (uri)
                importSources.push(
                    import(uri)
                );

            resolvedModule = await Promise.race(importSources);
            // For the frozen modules.
            resolvedModule = {...resolvedModule};

            if (defaultAs && resolvedModule?.default) {
                resolvedModule[defaultAs] = resolvedModule.default;
            }

            if (Object.keys(resolvedModule).every(o => o === "default")) {
                resolvedModule = resolvedModule.default;
            }

            if (exports && exports.length) {
                resolvedModule =  Object.entries(resolvedModule).reduce(
                    (acc, [exportName, exportValue]) => {
                        if (exports.includes(exportName)) {
                            acc[exportName] = exportValue;
                        }
                        return acc;
                    }
                );
            }
        }


        if (resolvedModule != null) {
            resolvedModule = await Promise.resolve(
                resolvedModule
            );
        }

        if (resolvedModule) {
            container.registerScoped({
                module: resolvedModule
            });
        }

        if (validationRequired) {
            const {valid} = container.cradle;

            try {
                if (!await Promise.resolve(valid)) {
                    await container.dispose();
                    throw new DependencyCouldNotBeValidated(name);
                }
            } catch (e) {
                await container.dispose();
                throw new DependencyCouldNotBeValidated(name, e);
            }

            container.register({
                valid: await valid
            }).registerScoped({
                installed: true
            });
        } else {
            container.register({
                // IT wasn't validated, and we don't want to give any
                // idea that it was.
                valid: false
            }).registerScoped({
                installed: true,
                // IT wasn't validated, and we don't want to give any
                // idea that it was.
                validator: undefined
            });
        }

        return container.cradle;
    }
}

export {installDependency};