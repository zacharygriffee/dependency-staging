import {importCode} from "./importCode.js";

export function parseValidatorToString(id, validator) {
    if (typeof validator === "function") {
        let validatorString = validator + "";
        if (validatorString.startsWith("validator")) {
            validatorString = validatorString.replace("validator", "function")
        }
        validator = `(${validatorString})(arguments[0])`;
    }

    let valid;
    const tag = `/*${id}*/`;
    if (typeof validator === "string" && !validator.includes(tag)) {
        const _validator = validator;
        valid = async (cradle) => {
            const keys = Object.keys(cradle).filter(o => o !== "validator" && o !== "valid").join(",");
            const _validatorCode = `${tag}export default function ({${keys}}) { return () => ${_validator}; }`;
            let validatorResult = await Promise.resolve(
                (await importCode(_validatorCode))?.default(cradle)
            );
            if (typeof validatorResult === "function") {
                validatorResult = await validatorResult(cradle);
            }
            return validatorResult;
        };
    } else {
        valid = false;
    }
    return {validator, valid};
}