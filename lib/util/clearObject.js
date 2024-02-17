export function clearObject(object) {
    for (let variableKey in object){
        if (object.hasOwnProperty(variableKey)){
            delete object[variableKey];
        }
    }
}