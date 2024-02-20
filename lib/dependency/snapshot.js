import {DependencyError} from "../errors.js";
import {parseValidatorToString} from "../stage/addDependency.js";

/**
 * @name snapshot
 * @memberOf Dependency
 * @instance
 * @kind method
 * @description Create a serializable javascript object of the dependency if the dependency is serializable, see
 * {@link Dependency.isSerializable} Snapshots can be added back into stage.addDependency which allows you to save the
 * state of the stage and reload it, or transfer the state of the stage over network.
 */
function snapshot(cradle) {
    return () => {
        const {isSerializable, name} = cradle;
        if (!isSerializable) {
            return new DependencyError(`Dependency "${name}" is not serializable.`);
        }

        const snapshot = {};

        for (let [name, value] of Object.entries(cradle)) {
            if (value && name === "validator" && typeof value !== "string") {
                value = parseValidatorToString(cradle.id, value).validator;
            }
            if (value == null || ["valid", "installed", "isSerializable"].includes(name)) continue;
            try {
                structuredClone(value);
                snapshot[name] = value;
            } catch (e) {}
        }

        return snapshot;
    }
}
export {snapshot};