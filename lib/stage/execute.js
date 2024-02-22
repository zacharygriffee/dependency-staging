/**
 * @name Execute
 * @instance
 * @description Get a dependency's module that has already been validated and installed.
 * @param {string|array<string>} name The name of the dependency. If array of strings, will return the module of each dependency.
 * If the dependency is not installed, this function will throw DependencyIsNotInstalled error.
 * @memberOf Stage
 */
import {DependencyIsNotInstalledError} from "../errors.js";

export function execute({get}) {
    return execute;

    function execute(name) {
        const ret = get(Array.isArray(name) ? name : [name]).map((o,i) => {
            if (!o || !o.installed) {
                throw new DependencyIsNotInstalledError(o || name[i]);
            }
            return o.installed ? o.module : undefined;
        });
        return !Array.isArray(name) ? ret[0] : ret;
    }
}