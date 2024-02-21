/**
 * @namespace Premade
 * @description Premade dependencies that can be added to your stages.
 * If you are running in node, all dependencies should be present in node_modules.
 * If you are in browser, add them to import map or else it will be imported
 * via the Stage.npmCdnResolver
 * @example
 * import {stage, Premade} from "dependency-staging";
 * stage.put(Premade);
 * await stage.install();
 */

import Basic from "./basic.js";
export {Basic};

export default [
    ...Basic
];