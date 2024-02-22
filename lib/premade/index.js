/**
 * @namespace premade
 * @description Premade dependencies that can be added to your stages.
 * If you are running in node, all dependencies should be present in node_modules.
 * If you are in browser, add them to import map or else it will be imported
 * via the Stage.npmCdnResolver
 *
 * <pre>
 *     // Dependencies needed to import premade
 *     b4a, compact-encoding, rxjs, rxjs/operators
 * </pre>
 *
 * @example
 * import {stage, premade} from "dependency-staging";
 * stage.put(premade);
 * await stage.install();
 */

import Basic from "./basic.js";
import "./rx.js";
export {Basic};

export default [
    ...Basic
];