import {DependencyCouldNotBeInstalled, DependencyCouldNotBeResolved, DependencyCouldNotBeValidated} from "../errors.js";
import {importCode} from "../util/importCode.js";
import {isNode} from "../util/is-node.js";

async function validateDependency(name, dependencyContainer) {
    const {valid} = dependencyContainer.cradle;
    let validResult;
    try {
        if (!(validResult = await Promise.resolve(valid))) {
            await dependencyContainer.dispose();
            throw new DependencyCouldNotBeValidated(name);
        }
    } catch (e) {
        await dependencyContainer.dispose();
        throw new DependencyCouldNotBeValidated(name, e);
    }

    dependencyContainer.register({
        valid: validResult
    }).registerScoped({
        installed: true
    });
}

async function formatModule(resolvedModule, defaultAs, exports) {
    // For the frozen modules.
    if (typeof resolvedModule === "object") resolvedModule = {...resolvedModule};

    if (defaultAs && resolvedModule?.default) {
        resolvedModule[defaultAs] = resolvedModule.default;
    }

    if (typeof resolvedModule === "object" && Object.keys(resolvedModule).every(o => o === "default")) {
        resolvedModule = resolvedModule.default;
    }

    if (exports && exports.length) {
        resolvedModule = Object.entries(resolvedModule).reduce(
            (acc, [exportName, exportValue]) => {
                if (exports.includes(exportName)) {
                    acc[exportName] = exportValue;
                }
                return acc;
            }
        );
    }

    if (resolvedModule != null) {
        resolvedModule = await Promise.resolve(
            resolvedModule
        );
    }

    return resolvedModule;
}

/**
 * @name install
 * @instance
 * @description Install the single dependency without it becoming a dependency to a stage. This is also used by
 * {@link Stage.install} to install dependencies to itself.
 *
 * The process of the installation goes like this:
 *
 * - Check if module is defined, if so, this will take precedence over all other below.
 * - if Dependency.npmSpecifier && node: will check if the npmSpecifier can be imported via node_modules.
 * - if Dependency.npmSpecifier && browser will check importMap if it includes this specifier,
 * - if Dependency.npmSpecifier && browser: will utilize npmCdnResolver resolver to attempt to get the specifier from it.
 * - if Dependency.code: turn it into an uri and add to importSources
 * - if Dependency.uri (application/javascript): add to importSources
 * - Then if any other importSources were added, they will be attempted after this.
 *
 * The importSources should strive to be as environmentally agnostic and serializable possible. Or at least have
 * a importSource for the environments the dependencies should support.
 *
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
            npmSpecifier,
            code,
            uri,
            importSources,
            optional,
            exports,
            defaultAs,
            installed,
            npmCdnResolver
        } = cradle;
        // try {
        if (installed) {
            throw new DependencyCouldNotBeInstalled(name, "Already installed.");
        }
        let resolvedModule = module;
        if (resolvedModule == null) {
            const _importSources = [...importSources];
            if (npmSpecifier) {
                if (npmSpecifier) {
                    if (isNode()) {
                        _importSources.unshift(import(npmSpecifier));
                    } else if (npmCdnResolver) {
                        if (typeof document !== "undefined") {
                            try {
                                const {imports} = JSON.parse(document.querySelector("[type='importmap']").innerHTML);
                                if (imports[npmSpecifier]) {
                                    _importSources.unshift(import(npmSpecifier));
                                }
                            } catch (e) {}
                        }
                        _importSources.unshift(npmCdnResolver(npmSpecifier))
                    }
                }
            }

            if (code)
                _importSources.unshift(
                    importCode(code)
                );

            if (uri)
                _importSources.unshift(
                    import(uri)
                );

            for await (const [index, promise] of Object.entries(_importSources)) {
                try {
                    resolvedModule = await promise
                    resolvedModule = await formatModule(resolvedModule, defaultAs, exports);

                    if (validationRequired) {
                        container.register({module: resolvedModule});
                        await validateDependency(name, container);
                    }
                } catch (e) {
                    container.register({module: undefined});
                    _importSources.splice(+index);
                    resolvedModule = undefined;
                }
            }

            if (resolvedModule == null) {
                throw new DependencyCouldNotBeResolved(name, "All import sources failed to resolve dependency");
            }
        } else {
            resolvedModule = await formatModule(resolvedModule, defaultAs, exports);
            if (validationRequired) await validateDependency(name, container);
        }


        if (resolvedModule) {
            container.registerScoped({
                module: resolvedModule
            });
        }

        if (!validationRequired) {
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
    };
}

export {installDependency};