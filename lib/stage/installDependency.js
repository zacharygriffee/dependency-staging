import * as gsh from "../util/get-set-has.js";

/**
 * Install a single dependency
 * @param {string} name The name of the dependency used when adding it via Stage.put
 * @param [validationRequired=true] If true, all dependencies must have a validator that checks integrity
 * @instance
 * @memberOf Stage
 */
function installDependency({dependencies}) {
    return (name, validationRequired) => {
        return gsh.get(dependencies, name).install(validationRequired);
    }
}

export {installDependency};