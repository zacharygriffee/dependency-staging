export function has(obj, key) {
    const keyParts = Array.isArray(key) ? key : key.split('.');

    return !!obj && (
        keyParts.length > 1
            ? has(obj[keyParts[0]], keyParts.slice(1).join('.'))
            : hasOwnProperty.call(obj, key)
    );
}


export function get(obj, path, defaultValue = undefined) {
    const travel = regexp =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
}

export function set(obj, path, value) {
    let arr = path;
    if (typeof path === "string") arr = path.split(/[,[\]]+?/);
    let pos = obj;
    for (let x = 0; x < arr.length; x++) {
        const p = arr[x];
        if (x === arr.length - 1) pos[p] = value;
        if (!pos[p]) pos[p] = {};
        pos = obj[p];
    }
    return obj;
}
