import {nanoid} from "../util/nanoid-non-secure.js";
import {clearObject} from "../util/clearObject.js";

/**
 * @name fork
 * @instance
 * @description Create a forked stage of this one. It will attain the dependencies of the parent stage,
 * and any new dependencies added and installed on the parent stage will be added to the forked stage automatically.
 * Disposing a fork will only remove the cached values and dependencies of itself, and dependencies it used will not
 * be disposed if other stages are using it.
 * @kind method
 * @memberOf Stage
 */
export function fork({container, depth, dependencies, forks}) {
    return () => {
        const scope = container.createScope();
        const _deps = {...dependencies};
        const id = nanoid();
        const idx = forks.push(scope.cradle) - 1;
        scope.registerScoped({
            id,
            container: () => scope,
            depth: depth + 1,
            dispose: ({container}) => () => container.dispose(),
            dependencies: {
                resolver: () => _deps,
                disposer: (deps) => {
                    clearObject(deps);
                    forks.splice(idx, 1);
                }
            }
        });
        return scope.cradle;
    }
}