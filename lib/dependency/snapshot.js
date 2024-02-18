import {DependencyError} from "../errors.js";

/**
 * @name snapshot
 * @memberOf Dependency
 * @instance
 * @kind method
 * @description Create a serializable javascript object of the dependency if the dependency is serializable, see
 * {@link Dependency.isSerializable}
 */
function snapshot({
                    id,
                    name,
                    code,
                    uri,
                    exports,
                    optional,
                    isSerializable
}) {
    return () => {
        if (!isSerializable) {
            throw new DependencyError(`Dependency "${name}" is not serializable.`);
        }
        return ({
            id,
            name,
            code,
            uri,
            exports,
            optional
        });
    }
}
export {snapshot};