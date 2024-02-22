import {observables} from "./rx/rxjs.js";
import {operators} from "./rx/rxjsOperators.js";
import {stage} from "dependency-staging";

stage.put([observables, operators]);
await stage.install();

/**
 * @namespace premade.rx
 * @description Add RxJS support to a stage. This will import directly into the root stage as a merger of both
 * rxjs.observables and rxjs.operators with the name 'rx'
 * <pre>
 *     // Dependencies needed to import premade.rx
 *     rxjs, rxjs/operators
 * </pre>
 * @example
 * await import("dependency-staging/premade/rx");
 * const {rx} = stage;
 * // rx is now available to use.
 */
stage.container.registerScoped({
    rx: ({ifExists, execute}) => {
        return ifExists(["rxjs.observables", "rxjs.operators"], () => {
            const [observables, operators] = execute(["rxjs.observables", "rxjs.operators"]);
            return {...operators, ...observables};
        });
    }
});
