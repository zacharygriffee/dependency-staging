import {StageMergeError} from "../errors.js";
import * as gsh from "../util/get-set-has.js";

/**
 * @name merge
 * @description Merge another stage into this one. All dependencies installed in the other stage,
 * will become installed in this stage. Another stage being disposed will not dispose the dependencies in this stage.
 * @kind method
 * @param {Stage} container the other stage to merge into this stage.
 * @instance
 * @memberOf Stage
 */
function merge(cradle) {
    const {
        dependencies: thisDependencies,
        depth: thisDepth,
        rootId: thisRootId,
        id: thisId
    } = cradle;
    return ({
                dependencies: otherDependencies,
                depth: otherDepth,
                rootId: otherRootId,
                id: otherId
            }) => {
        if (otherDepth < thisDepth && thisRootId === otherRootId) {
            throw new StageMergeError(thisId, otherId, "cannot merge a scoped stage into its parent stage.");
        }
        for (const [name, dependency] of Object.entries(otherDependencies)) {
            if (!gsh.has(thisDependencies, name, dependency)) {
                gsh.set(thisDependencies, name, dependency);
            }
        }
        return cradle;
    }
}

export {merge};