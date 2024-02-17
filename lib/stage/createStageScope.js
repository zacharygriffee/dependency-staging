import {nanoid} from "../util/nanoid-non-secure.js";
import {clearObject} from "../util/clearObject.js";

export function createStageScope({container, depth, dependencies, scopes}) {
    return () => {
        const scope = container.createScope();
        const _deps = {...dependencies};
        const id = nanoid();
        const idx = scopes.push(scope.cradle) - 1;
        scope.registerScoped({
            id,
            container: () => scope,
            depth: depth + 1,
            dispose: ({container}) => () => container.dispose(),
            dependencies: {
                resolver: () => _deps,
                disposer: (deps) => {
                    clearObject(deps);
                    scopes.splice(idx, 1);
                }
            }
        });
        return scope.cradle;
    }
}