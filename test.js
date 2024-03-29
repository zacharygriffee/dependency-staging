import {test, solo, skip} from "brittle";
import theAnswer from "the-answer";
// Creates a singleton stage.
import {stage} from "./index.js";

// A trick to get an instance to test 'alien stages' from other libraries
import {stage as alien} from "./dist/index.min.js";
import {clearObject} from "./lib/util/clearObject.js";

test("Dependency tests #1", async t => {
    const forkedStage = stage.fork();

    {
        const t_adding = t.test("Adding dependencies");
        t_adding.plan(4);
        const dep1 = forkedStage.put({
            name: "the-answer",
            code: "export default 24;",
            foo: "bar"
        });

        t_adding.is(dep1.foo, "bar");
        t_adding.is(stage.rootId, forkedStage.rootId);

        const dep2 = forkedStage.put({
            name: "the-answer",
            code: "export default 42;",
        });

        t_adding.pass("We can override over top of a dependency that has not been installed yet.");
        t_adding.is(dep2.foo, "bar", "dependency properties not overridden still same.");
    }

    {
        t.ok(forkedStage.exists("the-answer"), "can check to see the-answer exists.");
        const result = forkedStage.ifExists(["the-answer"], ([{code}]) => code);
        const result2 = forkedStage.ifExists("the-answer", ({code}) => code);
        t.is(result, "export default 42;", "You can use ifExists to do operations on a single...");
        t.is(result2, "export default 42;", "... or multiple (array) dependencies only if they all exist.");
    }

    {
        const t_install = t.test("Installing dependencies");
        t_install.plan(9);

        const theAnswerBeforeInstallation = forkedStage.get("the-answer");
        t_install.absent(theAnswerBeforeInstallation.module, "dependencies are not installed until 'install' is called on the stage");
        t_install.is(theAnswerBeforeInstallation.code, "export default 42;", "code is set through put.");
        await forkedStage.install(false);
        const theAnswerAfterInstallation = forkedStage.get("the-answer");
        t_install.is(theAnswerAfterInstallation.module, 42, `After installation occurs, the module exists.`);
        t_install.is(theAnswerAfterInstallation.code, "export default 42;", "code is set through put.");
        await t_install.exception(
            () => forkedStage.put({
                name: "the-answer",
                code: "export default 24;"
            })
            ,
            "Cannot add over top dependency if installed"
        );

        forkedStage.put({
            name: "the-other-answer",
            code: `export default "coffee";`
        });
        t_install.pass("We can add new dependencies.");

        await forkedStage.install(false);
        t_install.pass("And we can install new dependencies.");

        const {foo} = (forkedStage.dependencies)["the-answer"].cradle;
        t_install.is(foo, "bar", "install only installs new dependencies. Already installed deps don't get messed with");

        const {module} = (forkedStage.dependencies)["the-other-answer"].cradle;
        t_install.is(module, "coffee", "install only installs new dependencies.");
    }

    {
        const t_merge = t.test("Merge stages");
        t_merge.plan(3);
        const baseDeps = stage.dependencies;
        t_merge.alike(baseDeps, {}, "the base stage does not contain dependencies that the forked one installed.");
        t_merge.exception(() => forkedStage.merge(stage), "Cannot merge a parent stage into a forked stage");
        stage.merge(forkedStage);
        t_merge.alike(stage.dependencies, forkedStage.dependencies, "A parent stage can merge from forked stage");
    }

    {
        const t_disposal = t.test("Dispose a stage");
        t_disposal.plan(2);

        await forkedStage.container.dispose();
        t_disposal.alike(forkedStage.dependencies, {}, "dependencies are gone");
        const r = stage.dependencies;
        t_disposal.alike(Object.keys(r), ["the-answer", "the-other-answer"],
            "But because we did a merger above, we still have the dependencies in the parent stage.");

        await stage.container.dispose();
    }

});

test("Features | Optional", async t => {
    const parentFork = stage.fork();

    parentFork.put({
        name: "optionalDep",
        optional: true,
        code: "throw new Error('we throw to test an optional that doesn't run');"
    });

    await parentFork.install();

    {
        const {...optional} = parentFork.get("optionalDep");
        t.is(optional.installed, false, "Did not install, because the code threw error.");
    }

    parentFork.put("optionalDep", {
        code: "export default 3+2;",
        validator: "module === 4;"
    });

    await parentFork.install();
    {
        const {...optional} = parentFork.get("optionalDep");
        t.is(optional.installed, false, "Did not install, because the code could not be validated.");
    }

    const optDep = parentFork.put("optionalDep", {
        validator: "module === 5"
    });

    await parentFork.install();
    {
        const {module} = parentFork.get("optionalDep");
        t.is(module, 5, "Validator succeeded, the module didn't throw any errors.");

    }

    {
        await optDep.dispose();
        const {module, installed} = parentFork.get("optionalDep");
        t.absent(module, "We disposed the dep, so module should be undefined.");
        t.is(installed, false, "And installed is false.");
    }

    parentFork.dispose();
});

test("Stage.wand", async t => {
    const parentFork = stage.fork();

    parentFork.put({
        name: "theAnswer",
        npmSpecifier: "the-answer",
        validator() { return module === 42; }
    });

    parentFork.put({
        name: "notTheAnswer",
        module: 24,
        validator() { return module !== 42; }
    })

    await parentFork.install();
    const {wand} = parentFork;

    t.is(wand.theAnswer, 42);
    t.is(wand.notTheAnswer, 24);

    wand.chocolate = { module: "iceCream", validator: "module === 'iceCream'" };

    await parentFork.install();

    t.is(wand.chocolate, "iceCream");

    await parentFork.dispose();
});

test("premade dependencies BASIC", async t => {
    const {default: basic} = await import("dependency-staging/premade/basic");
    t.comment(`
        If ran in browser, the dependencies will first check the import map and then will use npmCdnResolver function
        that can be changed via container.register on the stage or on individual dependencies.
        compact-encoding is not in the test.html import map. But b4a is.
        
        IF ran in nodejs, the dependencies must be present in the node_modules for the typical import 
        resolution to work. Support for url's in nodejs is planned but it would be as an addon because
        such support would bloat the repo.
    `);
    const fork = stage.fork();
    await fork.put(basic);
    await fork.install();
    const [b4a, cenc] = fork.execute(["b4a", "compact-encoding"]);
    t.ok(b4a.isBuffer(b4a.from("hello")));
    const buff = cenc.encode(cenc.json, {hello: "world"});
    t.ok(b4a.isBuffer(buff));
    const back = cenc.decode(cenc.json, buff);
    t.alike(back, {hello: "world"});
    await fork.dispose();
});

test("premade dependencies rxjs", async t => {
    await import("dependency-staging/premade/rx");
    const {rx} = stage;
    const arr = [];
    rx.of("rxjs", "wired", "up").subscribe(o => arr.push(o));
    t.alike(arr, ["rxjs", "wired", "up"], "root stage has rxjs");
    const forkedStage = stage.fork();

    arr.length = 0;
    forkedStage.rx.of("rxjs", "wired", "up", "in fork").subscribe(o => arr.push(o));
    t.alike(arr, ["rxjs", "wired", "up", "in fork"], "All forks have rxjs");

    const operators = forkedStage.execute("rxjs.operators");
    t.ok(Object.keys(operators).includes("concatMap"), "if you need to access or convey operators to a dependency");
    const observables = forkedStage.execute("rxjs.observables");
    t.ok(Object.keys(observables).includes("concat"), "if you need to access or convey observables to a dependency");
    await forkedStage.dispose();
});

test("npm resolution", async t => {
    const parentFork = stage.fork();

    parentFork.put({
        name: "the-answer",
        npmSpecifier: "the-answer",
        validator() {
            return module === 42
        }
    });
    await parentFork.install();
    const {module} = parentFork.get("the-answer");
    t.is(module, 42, `
    If ran in node, will get the-answer from node_modules of this module. If you run this
    in node and get an error, make sure you have the-answer installed as dev
    If ran in browser, will get the npm specifier from jsdelivr or whatever choice of cdn you want
    if you set the npmCdnResolver resolver of the stage container. You can also set the npmCdnResolver
    for each individual dependency if it's necessary. Like if you have your own CDN with your own module
    resolution algorithm.
    `);

    parentFork.dispose();
});

test("Dependency forks, validation", async t => {
    const parentFork = stage.fork();

    const hotSauceDependencySnapshot = {
        name: "hot-sauce",
        eq: {
            resolver: () => "mustard",
            lifetime: "transient"
        },
        validator: `name === eq;`,
        module: theAnswer,
    };

    let hotSauceDependency = parentFork.put(hotSauceDependencySnapshot);

    await t.exception(() => parentFork.install());

    t.absent(hotSauceDependency.installed && hotSauceDependency.module, "installation didn't occur for the dependency.");

    t.comment(`The dependency is immediately disposed and removed from stage if it causes error and cannot be validated. It is
    necessary to add the dependency again with the correction. It is best to just get everything correct the first time.`)
    hotSauceDependencySnapshot.eq = {
        resolver: () => "hot-sauce",
        lifetime: "transient"
    };

    hotSauceDependency = parentFork.put(hotSauceDependencySnapshot)
    await parentFork.install();
    t.is(hotSauceDependency.installed && hotSauceDependency.module, 42, "");

    t.comment("Creating two fork stages from the parent stage");
    const childFork1 = parentFork.fork();
    const childFork2 = parentFork.fork();

    t.is(parentFork.forks.length, 2, "Parent forks has a length of 2");

    const {dependencies: parentDeps} = parentFork;
    const {dependencies: child1Deps} = childFork1;
    const {dependencies: child2Deps} = childFork2;

    t.alike(child1Deps, child2Deps, "Sibling forks are the same until you start adding dependencies to either or.");
    t.alike(child1Deps, parentDeps, "A fork of a stage will attain a decoupled dependencies object of the parent");

    t.ok(
        child1Deps["hot-sauce"].cradle.installed &&
        child2Deps["hot-sauce"].cradle.installed,
        "The forked hotSauceDependency that was installed in parent is already installed in the forked dependencies."
    );

    t.comment("Adding chocolate dependency to childFork1");

    childFork1.put({
        name: "chocolate",
        code: "export default 'ice cream';",
        validator: () => true
    });

    t.comment("Adding barbeque dependency to childFork2");
    childFork2.put({
        name: "barbeque",
        code: "export default 'spicy barbeque';",
        validator: () => true
    });


    t.alike(
        parentFork.get([
            "chocolate",
            "barbeque"
        ]),
        [undefined, undefined],
        "Dependencies (including installed ones) added to a fork does not add to the " +
        "parent fork. Use parent.merge(child) to attain a child's or alien stage's deps."
    );

    t.alike(
        childFork1.get(["chocolate", "barbeque"]).map(o => o?.code),
        ["export default 'ice cream';", undefined],
        "Chocolate ice cream was added to child 1, but not barbeque"
    );

    t.alike(
        childFork2.get(["chocolate", "barbeque"]).map(o => o?.code),
        [undefined, "export default 'spicy barbeque';"],
        "Spicy barbeque was added to child 2, but not chocolate ice cream"
    );

    t.comment(`Adding dependency to parent, the forks will attain the parent dependency. UNLESS the child fork already has
    a dependency with the same name which allows for overriding down the tree`);

    parentFork.put({
        name: "onion rings",
        code: "export default 'with spicy ranch';",
        validator: () => {
            return module === "with spicy ranch";
        }
    });

    await parentFork.install();

    t.comment("Installing childForks");

    await childFork1.install();
    await childFork2.install();

    t.ok(
        [
            childFork1.get("onion rings"),
            childFork2.get("onion rings")
        ].every(o => o.module === "with spicy ranch"),
        "both childFork1 and childFork2 acquired parent dep addition."
    );

    t.is(childFork1.get("chocolate").module, "ice cream");
    t.absent(parentFork.get("chocolate")?.module, "installing forked stage will not install into the parent.");
    t.comment("Disposing childFork1");

    await childFork1.dispose();
    const [childFork2FromParentForks, nothingMore] = parentFork.forks

    t.is(childFork2FromParentForks.id, childFork2.id, "Disposed dependency is removed from parent fork leaving only the child2 fork");
    t.absent(nothingMore, "No other fork but child2");
    const {chocolate: child1Chocolate, ["hot-sauce"]: child1HotSauce} = childFork1.dependencies;
    t.absent(child1Chocolate, "chocolate ice cream isn't installed in childFork1 after it was disposed.");
    t.absent(child1HotSauce, "Hot sauce is gone.");

    t.comment("Disposing parentFork");
    t.is(stage.forks.length + stage.forks[0].id, stage.forks.length + parentFork.id, "Before disposing, stage.forks should have parent fork as its only entry.");
    await parentFork.container.dispose();
    t.alike(stage.forks, [], "At this point, root stage has no dependencies because parentFork was its only one.");
    t.absent(
        parentFork.get("hot-sauce")?.module &&
        parentFork.get("hot-sauce")?.installed,
        "disposing of a parent does not dispose the forks.."
    );

    t.ok(childFork1.get(["chocolate", "hot-sauce"]).every(o => !o), "childFork1 both chocolate and hot sauce is not installed because of earlier disposal.");
    t.comment("Disposing childFork1");
    await childFork1.container.dispose();

    t.absent(childFork1.dependencies["hot-sauce"], `childFork1 dispose clears it's own deps.`);

    t.ok(childFork2.get(["barbeque", "hot-sauce"]).every(o => !!o), "sibling childFork2 still has its dependencies.")

    t.comment("Disposing childFork2");
    await childFork2.container.dispose();

    t.ok(childFork2.get(["chocolate", "hot-sauce"]).every(o => !o), "childFork2 was disposed so not dependencies anymore.");
    t.alike(parentFork.dependencies, {}, "At this point, the parentFork should have no dependencies.");
    t.alike(parentFork.forks, [], "At this point, the parentFork should have no forks.");
});

test("snapshot and isSerializable stage/dependency", async t => {
    t.comment(`
Serializable requires all dependencies to have a code or uri field to install module.
This will change by the time beta comes, as I'll be adding features from my other libraries 
like bring-your-own-storage-utilities to pack whatever source into a cache storage.

Actual serializable capabilities is coming soon.
`);

    const forkedStage = stage.fork();

    let funDependency = forkedStage.put({
        name: "fun",
        code: "export default 'balloons'"
    });

    let chocolateDependency = forkedStage.put({
        name: "chocolate",
        code: "export default 'with peanut butter'"
    });


    t.ok(forkedStage.isSerializable, "Checking on stage will check all dependencies.");
    t.ok(funDependency.isSerializable, "Checking on dependency will only check this dependency.");
    const forkedStageSnapshot = forkedStage.snapshot();
    {
        const {dependencies: {fun, chocolate}} = forkedStageSnapshot;
        {
            const {
                id,
                name,
                code,
                uri,
                exports,
                optional,
                validator,
                npmSpecifier
            } = fun;

            t.is(id, funDependency.id);
            t.is(name, "fun");
            t.is(code, "export default 'balloons'");
            t.is(uri, undefined);
            t.alike(exports, []);
            t.is(optional, false);
            t.is(validator, undefined);
            t.is(npmSpecifier, undefined);
        }

        {
            const {
                id,
                name,
                code,
                uri,
                exports,
                optional,
                validator,
                npmSpecifier
            } = chocolate;

            t.is(id, chocolateDependency.id);
            t.is(name, "chocolate");
            t.is(code, "export default 'with peanut butter'");
            t.is(uri, undefined);
            t.alike(exports, []);
            t.is(optional, false);
            t.is(validator, undefined);
            t.is(npmSpecifier, undefined);
        }
    }

    const forkFromForkedStageSnapshot = stage.fork(forkedStageSnapshot);

    t.alike(
        forkFromForkedStageSnapshot.get(["fun", "chocolate"]).map(o => o.id),
        [funDependency.id, chocolateDependency.id],
        "a stage forked from a snapshot will attain the snapshot dependencies including validations."
    );

    await forkFromForkedStageSnapshot.dispose();

    funDependency = forkedStage.put({
        name: "fun",
        code: undefined
    });

    t.absent(forkedStage.isSerializable, "Checking on stage will check all dependencies.");
    t.absent(funDependency.isSerializable, "Checking on dependency will only check this dependency.");
    t.exception(forkedStage.snapshot, "Cannot serialize a stage that has a non-serializable dependency.");

    chocolateDependency = forkedStage.put({
        name: "chocolate",
        code: "export default 'with marshmallow'",
        module: () => () => "A non serializable module isn't included in serializable. But a code or URI still must be present."
    });

    await chocolateDependency.install(false);
    t.ok(chocolateDependency.isSerializable);
    const chocolateSnapshot = chocolateDependency.snapshot();

    {
        const {
            id,
            name,
            code,
            exports,
            optional
        } = chocolateSnapshot;

        t.comment("Even after installation and the module is part of the chocolate dependency, it is still serializable" +
            " and can create a snap shot from it..")

        t.is(id, chocolateDependency.id);
        t.is(name, "chocolate");
        t.is(code, "export default 'with marshmallow'");
        t.alike(exports, []);
        t.is(optional, false);
    }

    await forkedStage.dispose();
    await funDependency.dispose();
    await chocolateDependency.dispose();
    await stage.dispose();

    const otherForkedStage = stage.fork();
    otherForkedStage.put(chocolateSnapshot);
    await otherForkedStage.install(false);
    const {id: originalId} = chocolateDependency;
    const {module, id: snapshotId, valid} = otherForkedStage.get("chocolate");

    t.is(module, "with marshmallow", "put from snapshot worked.");
    t.is(originalId, snapshotId, "The snapshot and original has the same ID");
    t.absent(valid, "Because we installed validationRequired=false, the dependency valid property will be false");

    otherForkedStage.put({
        name: "strawberry",
        code: "export default 'shortcake';",
        validator: "module === 'shortcake'"
    });

    const {dependencies: {strawberry}} = otherForkedStage.snapshot();
    t.is(strawberry.validator, "module === 'shortcake'", `Validator gets serialized with the snapshot. However, if a stage snapshot has a dependency 
    that doesn't have a validator and another that does, you have to install the snapshot without validation.`);
    const anotherForkedStage = stage.fork();

    anotherForkedStage.put({
        ...strawberry,
        validator: "module === 'shortcake'"
    });
    await anotherForkedStage.install();
    const strawberryDependency = anotherForkedStage.get("strawberry");
    t.ok(await strawberryDependency.valid, "We installed strawberry with validationRequired=true and had a serializable validator to validate");

    await otherForkedStage.dispose();
    await anotherForkedStage.dispose();
    await stage.dispose();
});

test("Validator", async t => {
    const forkedStage = stage.fork();
    forkedStage.put({
        name: "the-answer",
        code: "export default 42;",
        validator: "module !== 42"
    });

    await t.exception(forkedStage.install, "validator failed the install");

    const theAnswerDep = forkedStage.put({
        name: "the-answer",
        code: "export default 42;",
        validator: "module === 42"
    });

    await forkedStage.install();

    t.ok(forkedStage.get("the-answer").installed, "updated validator succeeded the install");
    t.ok(await forkedStage.get("the-answer").valid, "The validation is successful");

    await theAnswerDep.dispose();

    forkedStage.put({
        name: "the-answer",
        code: "export default 'forty two';",
        validator: "module === 'forty two';"
    });

    await forkedStage.install();

    t.ok(await forkedStage.get("the-answer").valid, "The validation is successful");
    await stage.dispose();
});

test("Alien vs Aircraft carrier (alien forks)", async t => {
    t.comment("Alien forks are forks from other libraries that use the dependency-staging library");
    alien.put(motherShipData);
    stage.put(airCraftCarrierData)

    await alien.install(false);
    await stage.install(false);

    alien.merge(stage);

    const [
        aircraftCarrier,
        motherShip
    ] = alien.get(["aircraft carrier", "mothership"]);

    t.ok(aircraftCarrier.installed, "Dependencies installed on alien fork will be installed on the fork it was merged to.");
    const {module: {nuclear, rocket}} = aircraftCarrier;
    const {module: {littleGun, bigGun}} = motherShip;

    let setDestroyed;
    let whenDestroyed = new Promise(resolve => setDestroyed = resolve);
    let destroyed = 0;
    let record = {};
    try {
        console.log(`${(await battle()).name} %cdestroyed`, "background-color: red; color:black; font-weight: bold");
    } catch (e) {
        debugger;
    }
    console.table(record);
    t.is(
        alien.dependencies["aircraft carrier"].cradle.health.hitpoints,
        aircraftCarrier.health.hitpoints,
        "The aircraft carrier dependency has same hit-points as the alien possessed. Cause the alien stage simply gets the dependency references from the local stage."
    );

    await aircraftCarrier.dispose();
    t.is(aircraftCarrier.health.hitpoints, 100, "Dispose essentially destroys the cached values and returns the dependency back to the original.");

    await stage.dispose();
    t.alike(stage.dependencies, {}, "stage dependencies don't have aircraft carrier anymore, due to being disposed.");
    t.alike(alien.dependencies, {
        ["aircraft carrier"]: aircraftCarrier.container,
        mothership: motherShip.container
    }, "But the alien stage still has references to both ships.");

    alien.fork();
    stage.merge(alien);
    t.alike(stage.dependencies, {
        ["aircraft carrier"]: aircraftCarrier.container,
        mothership: motherShip.container
    }, "We can merge alien back into stage and have the dependencies again.");

    await stage.dispose(stage);
    await alien.dispose(stage);

    function battle() {
        [
            nuclear.charge(),
            rocket.charge()
        ].forEach(o => o.then(gunCharged.bind(null, aircraftCarrier, motherShip)));

        [
            littleGun.charge(),
            bigGun.charge()
        ].forEach(o => o.then(gunCharged.bind(null, motherShip, aircraftCarrier)));
        return whenDestroyed;
    }

    async function gunCharged(instigator, target, gun) {
        if (destroyed) {
            return;
        }
        const lastHealth = {...target.health};
        await gun.shoot(target);

        (record[instigator.name + " " + gun.name] ||= {}).shot ||= 0;
        record[instigator.name + " " + gun.name].shot++;
        record[instigator.name + " " + gun.name].totalDamage ||= 0;
        record[instigator.name + " " + gun.name].totalDamage += lastHealth.hitpoints - target.health.hitpoints;

        if (target.health.hitpoints <= 0) {
            destroyed = true;
            setDestroyed(target);
        }
        return gun.charge().then(gunCharged.bind(null, instigator, target));
    }
});


const motherShipData = {
    name: "mothership",
    health: {
        resolver: () => ({
            hitpoints: 100
        })
    },
    code: `
${
        function _bigGun() {
            let chargePromise;
            const gun = {
                name: "big gun",
                verb: "boooooom",
                damageRange: [1, 6],
                charged: false,
                chargeTime: 25,
                charge() {
                    return chargePromise ||= new Promise(async resolve => {
                        setTimeout(async () => {
                            chargePromise = undefined;
                            gun.charged = true;
                            resolve(gun);
                        }, gun.chargeTime);
                    });
                },
                async shoot(target) {
                    if (chargePromise) await chargePromise;
                    const damageRoll = Math.floor(Math.random() * (gun.damageRange[1] - gun.damageRange[0])) + gun.damageRange[0];
                    target.health.hitpoints -= damageRoll;
                }
            }
            return gun;
        }
    }
${
        function _littleGun() {
            let chargePromise;
            const gun = {
                name: "little gun",
                verb: "pew pew",
                damageRange: [0.1, 0.8],
                charged: false,
                chargeTime: 6,
                charge() {
                    return chargePromise ||= new Promise(async resolve => {
                        setTimeout(async () => {
                            chargePromise = undefined;
                            gun.charged = true;
                            resolve(gun);
                        }, gun.chargeTime);
                    });
                },
                async shoot(target) {
                    if (chargePromise) await chargePromise;
                    const damageRoll = Math.floor(Math.random() * (gun.damageRange[1] - gun.damageRange[0])) + gun.damageRange[0];
                    target.health.hitpoints -= damageRoll;
                }
            }
            return gun;
        }
    }
        
        export const bigGun = _bigGun();
        export const littleGun = _littleGun();
        `
};
const airCraftCarrierData = {
    name: "aircraft carrier",
    health: {
        resolver: () => ({
            hitpoints: 100
        })
    },
    code: `
            ${
        function _nuclear() {
            let chargePromise;
            const gun = {
                name: "nuclear weapon",
                verb: "launched",
                damageRange: [10, 13],
                charged: false,
                chargeTime: 100,
                charge() {
                    return chargePromise ||= new Promise(async resolve => {
                        setTimeout(async () => {
                            chargePromise = undefined;
                            gun.charged = true;
                            resolve(gun);
                        }, gun.chargeTime);
                    });
                },
                async shoot(target) {
                    if (chargePromise) await chargePromise;
                    const damageRoll = Math.floor(Math.random() * (gun.damageRange[1] - gun.damageRange[0])) + gun.damageRange[0];
                    target.health.hitpoints -= damageRoll;
                }
            }
            return gun;
        }
    }
${
        function _rocket() {
            let chargePromise;
            const gun = {
                name: "rocket",
                verb: "fired",
                damageRange: [0.3, 1.2],
                charged: false,
                chargeTime: 10,
                charge() {
                    return chargePromise ||= new Promise(async resolve => {
                        setTimeout(async () => {
                            chargePromise = undefined;
                            gun.charged = true;
                            resolve(gun);
                        }, gun.chargeTime);
                    });
                },
                async shoot(target) {
                    if (chargePromise) await chargePromise;
                    const damageRoll = Math.floor(Math.random() * (gun.damageRange[1] - gun.damageRange[0])) + gun.damageRange[0];
                    target.health.hitpoints -= damageRoll;
                }
            }
            return gun;
        }
    }
            export const rocket = _rocket();
            export const nuclear = _nuclear();
        `
};

