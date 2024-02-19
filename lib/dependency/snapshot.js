import {DependencyError} from "../errors.js";

/**
 * @name snapshot
 * @memberOf Dependency
 * @instance
 * @kind method
 * @description Create a serializable javascript object of the dependency if the dependency is serializable, see
 * {@link Dependency.isSerializable} Snapshots can be added back into stage.addDependency which allows you to save the
 * state of the stage and reload it, or transfer the state of the stage over network.
 */
function snapshot({
                    id,
                    name,
                    code,
                    uri,
                    exports,
                    optional,
                    validator,
                    isSerializable
}) {
    return () => {
        if (!isSerializable) {
            return new DependencyError(`Dependency "${name}" is not serializable.`);
        }
        return ({
            id,
            name,
            code,
            uri,
            exports,
            optional,
            validator
        });
    }
}
export {snapshot};