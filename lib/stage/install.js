import * as gsh from "../util/get-set-has.js";
import {DependencyError, InstallationError, MultipleErrors} from "../errors.js";

/**
 * Install all dependencies that have not yet been installed. This returns the resolved dependencies.
 *
 * This should almost be error handled / caught as most dependency installation errors will be brought up here.
 * If an installation fails without being caught, it will hang the process (browser/node) without notice for
 * security purposes.
 *
 * <pre>
 * Error potentials:
 *  MultipleErrors
 *  DependencyError,
 *  InstallationError,                  // If installation fails because a non-optional dependency failed to install
 *      - DependencyCouldNotBeInstalled,// A non-optional dependency failed to install
 *      - DependencyCouldNotBeValidated,// A non-optional dependency failed its validation.
 * </pre>
 *
 *
 * @param [validationRequired=Dependency.requireDependencyValidation]  Validation required for all dependencies installed.
 * @instance
 * @memberOf Stage
 * @returns {function(*=): Promise<{failedCount: number, rejected: {}, failed, resolved: {}}>}
 */
function install({dependencies, requireDependencyValidation, id, npmCdnResolver}) {
    return async (validationRequired = requireDependencyValidation) => {
        let resolved = {};
        let rejected = [];
        let failed = 0;
        for await (const dependency of Object.values(dependencies)) {
            const {
                name,
                optional,
                install,
                installed,
            } = dependency.cradle;
            if (installed) {
                gsh.set(resolved, name, dependency);
                continue;
            }

            try {
                await install(validationRequired);
                gsh.set(resolved, name);
            } catch (e) {
                if (e instanceof DependencyError) {
                    if (!optional) {
                        failed++;
                    }
                    rejected.push(e);
                    // gsh.set(rejected, name, {dependency, error: dependencyInstallation});
                } else {
                    throw e;
                }
            }

        }

        if (failed) {
            if (rejected.length > 1) {
                throw new MultipleErrors(id, rejected)
            } else if (rejected.length === 1) {
                throw new InstallationError(id, rejected[0]);
            }
        }
        return resolved;
    }
}

export {install};