/**
 * @name compactEncoding
 * @description Handling encoding to and from buffers in a compact way.
 * @see https://github.com/holepunchto/compact-encoding
 * @example
 * stage.put(premade.basic.compactEncoding);
 * @memberOf premade.basic
 */
export const compactEncoding = ({
        name: "compact-encoding",
        npmSpecifier: "compact-encoding",
        validator() {
            // Basic validator that could be written more like a unit test.
            const keys = Object.keys(module);

            return [
                "array","ascii","base64","binary","bool","decode","encode","fixed32","fixed64",
                "float32","float32array","float64","float64array","frame","hex","int","int16",
                "int16array","int24","int32","int32array","int40","int48","int56","int64","int8","int8array",
                "json","lexint","ndjson","none","state","ucs2"
            ].every(o => keys.includes(o));
        }
    }
);