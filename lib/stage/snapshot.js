import {DependencyError, DependencyNotSerializable, MultipleErrors} from "../errors.js";

/**
 * @name snapshot
 * @description Create snapshot of the dependencies the stage directly handles (not forks). You can rehydrate the
 * stage's snapshot in the 'stage.fork' function. Currently and it is not planned to cannot create an `alien stage`
 * from a snapshot.
 * @memberOf Stage
 * @instance
 * @kind method
 * @returns {object}
 */
function snapshot(cradle) {
    return () => {
        const {dependencies} = cradle;
        const snapshot = {
            dependencies: {}
        };
        for (const [name, value] of Object.entries(cradle)) {
            if (value == null || ["dependencies", "isSerializable"].includes(name)) continue;
            try {
                structuredClone(value);
                snapshot[name] = value;
            } catch (e) {}
        }

        const failed = []
        for (const [name,dependencyContainer] of Object.entries(dependencies)) {
            if (!dependencyContainer) {
                throw new DependencyError("Stage.dependencies corrupted. Cannot serialize.");
            }
            const {snapshot: _snapshot, isSerializable} = dependencyContainer.cradle
            if (!isSerializable) {
                failed.push(new DependencyNotSerializable(name));
                continue;
            }
            if (!failed.length) snapshot.dependencies[name] = _snapshot();
        }
        if (failed.length === 1) {
            const [e] = failed;
            throw e;
        } else if (failed > 1) {
            throw new MultipleErrors("Stage.toJSON", failed);
        }
        return snapshot;
    }
}

export {snapshot};