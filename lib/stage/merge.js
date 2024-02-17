import {StageMergeError} from "../errors.js";
import * as gsh from "../util/get-set-has.js";

export function merge(cradle) {
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