import {identity} from "../util/identity.js";
import {isBoolean} from "../util/isBoolean.js";
import * as gsh from "../util/get-set-has.js";
import {InstallationError, MultipleErrors} from "../errors.js";

export function install({dependencies, requireDependencyValidation}) {
    return async (refinement = identity, validationRequired = requireDependencyValidation) => {
        if (isBoolean(refinement)) {
            validationRequired = refinement;
            refinement = identity
        }
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
                const dependencyInstallation = await install(refinement, validationRequired);
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