/**
 * @name ifExists
 * @instance
 * @description If a dependency or dependencies exists, the callback will be called.
 * @param {string|array<string>} name An array or string of dependencies to call the callback with if they all exist.
 * @param {function} cb The first argument of the callback will be the cradle of the dependency, and the second argument
 * will be the stage's cradle.
 * @memberOf Stage
 */

export function ifExists(cradle) {
    return (dependency, cb) => {
        const {exists, get} = cradle;
        const hasIt = Array.isArray(dependency) ? dependency.every(name => exists(name)) : exists(dependency);
        if (hasIt) {
            return cb(get(dependency), cradle);
        }
        return undefined;
    }
}