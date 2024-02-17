import {createContainer} from "../installAwilix.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {merge} from "./merge.js";
import {install} from "./install.js";
import {clearObject} from "../util/clearObject.js";
import {addDependency} from "./addDependency.js";
import {createStageScope} from "./createStageScope.js";
import {installDependency} from "./installDependency.js";

const rootId = nanoid()
const rootDependencies = {};
const stageContainer = createContainer()
    .registerSingleton({
        rootId
    })
    .registerScoped({
        depth: 0,
        merge,
        id: () => rootId,
        container: () => stageContainer,
        install,
        scopes: {
            resolver: () => ([]),
            disposer: (scopes) => scopes.length = 0
        },
        pack: null,
        packConfiguration: {},
        dependencies: {
            resolver: () => rootDependencies,
            disposer: clearObject
        },
        installDependency: installDependency,
        requireDependencyValidation: true,
        addDependency,
        dispose({container}) {
            return () => container.dispose()
        },
        createStageScope
    });

export {stageContainer};