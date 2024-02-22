/**
 * @namespace Container
 * @description All properties of a container can be overridden with your own resolvers after the fact.
 * How to configure a container and its resolvers see: {@link https://github.com/zacharygriffee/simplified-awilix SimplifiedAwilix}
 * @see https://github.com/zacharygriffee/simplified-awilix
 * @example // Typical flow
 *
 * // stage is a singleton root container where you can fork into other containers I call stages.
 * import {stage} from "dependency-staging"
 *
 * // You can register your own resolvers here.
 * stage.container.registerSingleton({
 *     appVersion: "1.0.1"
 * });
 */