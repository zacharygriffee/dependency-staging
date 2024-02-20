import {getStage} from "./lib/stage/getStage.js";
import * as Premade from "./lib/premade-dependencies/index.js";
const stage = getStage();

const cradle = stage.cradle;
const {install: stageInstall} = cradle;
export {
    cradle as stage,
    stage as stageContainer,
    stageInstall as install,
    Premade
};
