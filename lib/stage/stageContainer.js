import {createContainer} from "../installAwilix.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {merge} from "./merge.js";
import {install} from "./install.js";
import {clearObject} from "../util/clearObject.js";
import {put} from "./put.js";
import {fork} from "./fork.js";
import {installDependency} from "./installDependency.js";
import {get} from "./get.js";
import {isSerializable} from "./isSerializable.js";
import {snapshot} from "./snapshot.js";
import {exists} from "./exists.js";
import {ifExists} from "./ifExists.js";
import {execute} from "./execute.js";
import {wand} from "./wand.js";

/**
 * @namespace Stage
 * @description A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on
 */

const rootId = nanoid()
const rootDependencies = {};


/**
 * @name Stage
 * @description A Stage is a Container that holds dependencies and specialized resolvers for the stage that relies on
 * the dependencies.
 * @kind container
 * @see https://github.com/zacharygriffee/simplified-awilix
 * @property {string} id A unique id of the stage. This changes every new application.
 * @property {string} rootId The id of the stage that is the root of this stage. e.g. the master stage.
 * @property {Container} container the {@link https://github.com/zacharygriffee/simplified-awilix awilix container} of this stage
 * @property {number} depth Fork depth of this stage.
 * @property {array} forks All forks of this stage.
 * @property {object} dependencies An object of dependencies installed to this stage. Installed dependencies will be propagated
 * into any forked stages.
 * @property {boolean} [requireDependencyValidation=true] Whether this stage will require dependency validations
 * @type {Container}
 */

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
        forks: {
            resolver: () => ([]),
            disposer: (scopes) => scopes.length = 0
        },
        pack: null,
        packConfiguration: {},
        dependencies: {
            resolver: () => rootDependencies,
            disposer: clearObject
        },
        requireDependencyValidation: true,
        installDependency: installDependency,
        /**
         * @name npmCdnResolver
         * @description Define how an npmSpecifier is resolved if being resolved from a browser or environment that supports
         * module import from url. This will apply to all dependencies of this stage.
         * @kind method
         * @memberOf Stage
         * @instance
         */
        npmCdnResolver: () => (npmSpecifier) => import(`https://cdn.jsdelivr.net/npm/${npmSpecifier}/+esm`),
        put,
        get,
        execute,
        wand,
        /**
         * An alias function for the container's dispose function.
         * @kind method
         * @memberOf Stage
         * @instance
         * @returns Promise<void>
         */
        dispose({container}) {
            return () => container.dispose()
        },
        fork,
        ifExists
    })
    .registerTransient({
        exists,
        snapshot,
        isSerializable
    });

export {stageContainer};