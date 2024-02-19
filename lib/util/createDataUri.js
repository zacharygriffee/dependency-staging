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