/**
 * Create a data uri from source. Default behavior is to create from javascript file
 * @memberof Resolve
 * @param content data
 * @param config
 * @param [config.mimeType="text/javascript"] the data type.
 * @param [config.charset="utf-8"] the charset
 * @returns {string}
 */
export function createDataUri(content, config = {}) {
    const {
        mimeType = "text/javascript",
        charset = "utf-8"
    } = config;

    let charsetPart = "";

    if (charset !== null) {
        charsetPart += `charset=${charset};`
    }
    return `data:${mimeType};${charsetPart}base64,${(btoa(content))}`;
}
/**
 * Import virtual javascript module from string.
 *
 * @param code data
 * @param config
 * @param [config.mimeType="text/javascript"] the data type.
 * @param [config.encodingString="base64"] encoding
 * @param [config.charset="utf-8"] the charset
 * @returns {Promise<*>}
 * @memberof Resolve
 */
export async function importCode(code, config = {}) {
    try {
        return await import(createDataUri(code, config));
    } catch (e) {
        if (e.code === "ERR_INVALID_URL") {
            throw new TypeError("Could not import code. If the code has any 'require' or 'import' statements, the import will not work without a bundler.");
        }
        throw e;
    }
}
