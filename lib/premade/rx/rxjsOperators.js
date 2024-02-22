/**
 * @name operators
 * @description import rxjs operators separately from observables. If you are using both operators and observables
 * it is best to just import dependency-staging/premade/rx
 * @see https://rxjs.dev/api
 * @example
 * import {operators} from "dependency-staging/premade/rx/operators.js";
 * stage.put(operators);
 * await stage.install();
 * const rxjsOperators= stage.execute("rxjs.operators")
 * @memberOf premade.rx
 */

export const operators = {
    name: "rxjs.operators",
    npmSpecifier: "rxjs/operators",
    validator() {
        return true;
    }
};


