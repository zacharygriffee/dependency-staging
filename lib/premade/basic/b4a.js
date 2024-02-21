/**
 * @name b4a
 * @description Buffer handling
 * @see https://github.com/holepunchto/b4a
 * @example
 * stage.put(Premade.Basic.b4a);
 * @memberOf Premade.Basic
 */
export const b4a = ({
        name: "b4a",
        optional: false,
        npmSpecifier: "b4a",
        validator() {
            // Basic validator that could be written more like a unit test.
            const keys = Object.keys(module);
            return [
                "alloc", "allocUnsafe", "allocUnsafeSlow", "byteLength", "compare", "concat",
                "copy", "equals", "fill", "from", "includes", "indexOf", "isBuffer",
                "isEncoding", "lastIndexOf", "readDoubleLE", "readFloatLE", "readInt32LE", "readUInt32LE",
                "swap16", "swap32", "swap64", "toBuffer", "toString", "write", "writeDoubleLE", "writeFloatLE",
                "writeInt32LE", "writeUInt32LE"
            ].every(o => keys.includes(o));
        }
    }
);