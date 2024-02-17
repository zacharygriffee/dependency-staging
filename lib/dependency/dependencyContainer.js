import {createContainer} from "../installAwilix.js";
import {nanoid} from "../util/nanoid-non-secure.js";
import {installDependency} from "./installDependency.js";

const dependencyContainer =
    createContainer()
        .registerScoped({
            id: () => nanoid(),
            installed: false,
            name: "",
            container: () => undefined,
            optional: false,
            code: undefined,
            uri: undefined,
            module: undefined,
            install: installDependency,
            exports: [],
            async validator(module) {
                return !!module
            },
            dispose: ({container}) => () => container.dispose(),
        });

export {dependencyContainer};