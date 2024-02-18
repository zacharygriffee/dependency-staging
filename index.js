import {getStage} from "./lib/stage/getStage.js";

const stage = getStage();
const cradle = stage.cradle;
const {install: stageInstall} = cradle;
export {cradle as stage, stage as stageContainer, stageInstall as install};
