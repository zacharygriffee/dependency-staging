import {DependencyIsNotInstalledError} from "../errors.js";

/**
 * Wand is an experimental way of adding and getting dependencies from a stage
 *
 * @example
 * stage.wand.theAnswer = {name: "theAnswer", npmSpecifier: "the-answer", validator: "module === 42"};
 * stage.wand.b4a = {name: "b4a", npmSpecifier: "b4a", validator: "typeof module.isBuffer === 'function'"};
 * await stage.install();
 * const {theAnswer, b4a} = stage.wand;
 * theAnswer // 42;
 * b4a // functions of b4a repo.
 *
 * @returns Proxy
 * @instance
 * @memberOf Stage
 */
export function wand({dependencies, put}) {
    return new Proxy(dependencies, {
        get(target, property) {
            const container = target[property];
            if (!container) throw new DependencyIsNotInstalledError(property);
            if (container.cradle.module && container.cradle.installed) {
                return container.cradle.module;
            }
            throw new DependencyIsNotInstalledError(property);
        },
        set(target, property, value) {
            put(property, value);
            return true;
        }
    })
}