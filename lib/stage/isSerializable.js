
/**
 * @name isSerializable
 * @description Whether ALL direct dependencies of the stage (not forks) is serializable and a snapshot can be created from it.
 * See {@link Stage.snapshot} and {@link Dependency.isSerializable}
 * @kind property
 * @instance
 * @memberOf Stage
 * @returns {boolean|undefined} true or falsy
 */
function isSerializable({dependencies}) {
    return Object.values(dependencies).every(o => o.cradle.isSerializable)
}

export {isSerializable};