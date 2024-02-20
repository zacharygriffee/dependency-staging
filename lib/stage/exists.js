
/**
 * @name exists
 * @instance
 * @description Check if a dependency exists.
 * @param {string|array<string>} dependency The name of the dependency. If array of strings, will check each dependency in the
 * list whether it exists
 * @memberOf Stage
 */
export const exists = {
    resolver({get}) {
        return (dependency) => Array.isArray(dependency) ? dependency.every((d) => !!d) : !!get(dependency);
    },
    type: "transient"
}