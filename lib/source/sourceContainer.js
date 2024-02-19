import {createContainer} from "../installAwilix.js";
import {createDataUri} from "../util/createDataUri.js";
import {isNode} from "../util/is-node.js";

function source(sourceInterface = {}) {
    const {
        code, uri, npm, gh, importSources = [], module
    } = sourceInterface;
    let resolved = module;
    const sourceContainer = createContainer()
        .registerTransient({
            type: "",
            container: () => sourceContainer,
            code, uri, npm, gh,
            importSources: {
                resolver: () => importSources,
                dispose() {
                    importSources.length = 0;
                }
            },
            resolved: {
                resolver: () => resolved,
                dispose() {
                    resolved = undefined;
                }
            },
            async module({code, uri, npm, gh, importSources}) {
                if (resolved) return resolved;
                if (isNode()) {
                    return await import(npm);
                }
                if (npm) {
                    importSources.push(import(`https://cdn.jsdelivr.net/npm/${npm}/+esm`));
                }
                if (gh) {
                    importSources.push(import(`https://cdn.jsdelivr.net/gh/${gh}`));
                }
                if (code && !uri) {
                    uri = createDataUri(code);
                }
                if (uri) {
                    importSources.push(import(uri));
                }

                return resolved = await Promise.race(importSources);
            }
        }).cradle;
    return sourceContainer;
}



export {source};
