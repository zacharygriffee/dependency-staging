
/**
 * @name observables
 * @description import rxjs observables separately from operators. If you are using both operators and observables
 * it is best to just import dependency-staging/premade/rx
 * @see https://rxjs.dev/api
 * @example
 * import {observables} from "dependency-staging/premade/rx/observables.js";
 * stage.put(observables);
 * await stage.install();
 * const rxjsObservables = stage.execute("rxjs.observables")
 * @memberOf premade.rx
 */

export const observables = {
    name: "rxjs.observables",
    npmSpecifier: "rxjs",
    validator() {
        return true;
    }
};

