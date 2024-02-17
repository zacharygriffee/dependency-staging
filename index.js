import {createStage} from "./lib/stage/createStage.js";

const stage = createStage();
const cradle = stage.cradle;
const {install: stageInstall} = cradle;
export {cradle as stage, stageInstall as install};
