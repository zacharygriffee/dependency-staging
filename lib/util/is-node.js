function isNode() {
    return typeof process !== "undefined" && process?.versions?.node;
}

export {isNode};