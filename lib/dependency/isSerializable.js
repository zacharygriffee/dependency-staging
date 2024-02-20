import {isSerializable as _isSerializable} from "../util/isSerializable.js";

/**
 * @name isSerializable
 * @description Whether the dependency is serializable. For now, it checks if code or uri exists and whether it
 * can be serialized judged by structuredClone algorithm.
 * Because the resolvers for code and uri does not necessarily have to be serializable.
 * This checker requires that code or uri is declared on the container, if not, it will return undefined rather than
 * false
 * @kind property
 * @instance
 * @memberOf Dependency
 * @returns {boolean|undefined} true or falsy
 */
function isSerializable({
                            code,
                            uri,
                            npmSpecifier,
                            importSources
}) {
    return (code || uri || npmSpecifier || importSources.length) && _isSerializable(code || uri || npmSpecifier || importSources);
}

export {isSerializable};