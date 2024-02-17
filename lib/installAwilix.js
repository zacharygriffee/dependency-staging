import * as Awilix from "./util/awilix-browser.js";
import {createContainer, install as installSimplifiedAwilix} from "simplified-awilix";
await installSimplifiedAwilix({
    resolvedDependencies: {
        awilix: Awilix
    }
});
export {createContainer, installSimplifiedAwilix};