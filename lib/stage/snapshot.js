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
function snapshot({dependencies}) {
    return () => {
        const failed = [];
        const success = {};
        for (const [name,dependencyContainer] of Object.entries(dependencies)) {
            if (!dependencyContainer) {
                throw new DependencyError("Stage.dependencies corrupted. Cannot serialize.");
            }
            const {snapshot, isSerializable} = dependencyContainer.cradle
            if (!isSerializable) {
                failed.push(new DependencyNotSerializable(name));
                continue;
            }
            if (!failed.length) success[name] = snapshot();
        }
        if (failed.length === 1) {
            const [e] = failed;
            throw e;
        } else if (failed > 1) {
            throw new MultipleErrors("Stage.toJSON", failed);
        }
        return success;
    }
}

export {snapshot};