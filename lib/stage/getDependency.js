import {get} from "../util/get-set-has.js";

/**
 * @name getDependency
 * @instance
 * @description Get a dependency that was added via addDependency whether installed or not.
 * @param {string|array<string>} name The name of the dependency. If array of strings, will get each dependency in the
 * list, and  return the list of dependencies in that order.
 * @param {boolean} [asContainer = false] Return the dependency as a container instead of its proxy cradle.
 * @memberOf Stage
 */
export function getDependency({dependencies}) {
    return getter;

    function getter(name, asContainer = false) {
        return Array.isArray(name) ? name.flat().map((x) => getter(x)) : asContainer ? get(dependencies, name) : get(dependencies, name)?.cradle;
    }
}