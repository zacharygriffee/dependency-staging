import * as gsh from "../util/get-set-has.js";

export function installDependency({dependencies}) {
    return (name, refinement, validationRequired) => {
        return gsh.get(dependencies, name).install(refinement, validationRequired);
    }
}