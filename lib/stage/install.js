import * as gsh from "../util/get-set-has.js";
import {InstallationError, MultipleErrors} from "../errors.js";

/**
 * Install all dependencies that have not yet been installed. This returns an object with following signature:
 * <pre>
 * {
 *      failedCount,     // How many failed ( both optional and non-optional failures )
 *      failed,          // Whether the installation failed. Failed optional
 *                       // dependencies will not cause the installation to fail
 *      resolved,        // All resolved dependencies
 *      rejected         // All rejected dependencies
 * }
 * </pre>
 * @param [validationRequired=Dependency.requireDependencyValidation]  Validation required for all dependencies installed.
 * @memberOf Stage
 * @returns {function(*=): Promise<{failedCount: number, rejected: {}, failed, resolved: {}}>}
 */
function install({dependencies, requireDependencyValidation}) {
    return async (validationRequired = requireDependencyValidation) => {
        let resolved = {};
        let rejected = {};
        let failed = 0;
        for await (const dependency of Object.values(dependencies)) {
            const {
                name,
                optional,
                install,
                installed
            } = dependency.cradle;
            if (installed) {
                gsh.set(resolved, name, dependency);
                continue;
            }
            try {
                const dependencyInstallation = await install(validationRequired);
                gsh.set(resolved, name, dependencyInstallation);
            } catch (e) {
                if (!optional) failed++;
                gsh.set(rejected, name, {dependency, error: e});
            }
        }
        if (!!failed) {
            if (failed > 1) {
                throw new MultipleErrors(`Installation Failures (${failed})`, rejected.map(({dependency, error}) => {
                    return new InstallationError(dependency.cradle.name, error);
                }))
            } else {
                const {dependency, error} = Object.values(rejected)[0];
                throw new InstallationError(dependency.cradle.name, error);
            }
        }
        return {
            resolved,
            rejected,
            failed: !!failed,
            failedCount: failed
        }
    }
}

export {install};