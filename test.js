import {test, solo, skip} from "brittle";
import {pack, rollupFromJsdelivr, rollupVirtualPlugin} from "bring-your-own-storage-utilities/deploy";
import theAnswer from "the-answer";
import {fork} from "./lib/stage/fork.js";
// Creates a singleton stage.
import {stage} from "./index.js";
// A trick to get an instance to test 'alien stages' from other libraries
import {stage as alien} from "./dist/index.min.js";

test("Dependency tests #1", async t => {
    const forkedStage = stage.fork();
    const alienStage = alien.fork();

    alienStage.id;
    forkedStage.id;
    {
        const t_adding = t.test("Adding dependencies");
        t_adding.plan(4);
        const dep1 = forkedStage.addDependency({
            name: "the-answer",
            code: "export default 24;",
            foo: "bar"
        });

        t_adding.is(dep1.foo, "bar");
        t_adding.is(stage.rootId, forkedStage.rootId);

        const dep2 = forkedStage.addDependency({
            name: "the-answer",
            code: "export default 42;",
        });

        t_adding.pass("We can override over top of a dependency that has not been installed yet.");
        t_adding.is(dep2.foo, "bar", "dependency properties not overridden still same.");
    }

    {
        const t_install = t.test("Installing dependencies");
        t_install.plan(9);

        const theAnswerBeforeInstallation = (forkedStage.dependencies)["the-answer"].cradle;
        t_install.absent(theAnswerBeforeInstallation.module, "dependencies are not installed until 'install' is called on the stage");
        t_install.is(theAnswerBeforeInstallation.code, "export default 42;", "code is set through addDependency.");
        await forkedStage.install(false);
        const theAnswerAfterInstallation = (forkedStage.dependencies)["the-answer"].cradle;
        t_install.is(theAnswerAfterInstallation.module, 42, "After installation occurs, the module exists.");
        t_install.is(theAnswerAfterInstallation.code, "export default 42;", "code is set through addDependency.");

        t_install.exception(() =>
                forkedStage.addDependency({
                    name: "the-answer",
                    code: "export default 24;"
                }),
            "Cannot add over top dependency if installed"
        );

        forkedStage.addDependency({
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

test("Dependency forks, validation", async t => {
    const parentFork = stage.fork();

    const hotSauceDependency = parentFork.addDependency({
        name: "hot-sauce",
        eq: {
            resolver: () => "mustard",
            lifetime: "transient"
        },
        validator: ({name, eq}) => name === eq,
        module: theAnswer,
    });

    await t.exception(() => parentFork.install(), "Validation failed exception");
    t.absent(hotSauceDependency.installed && hotSauceDependency.module, "installation didn't occur for the dependency.");

    hotSauceDependency.container.register({
        eq: {
            resolver: () => "hot-sauce",
            lifetime: "transient"
        }
    });
    await parentFork.install();
    t.is(hotSauceDependency.installed && hotSauceDependency.module, 42, "But we can register the variable of the dependency that will cause the validator to succeed.");

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

    const chocolateDependency = childFork1.addDependency({
        name: "chocolate",
        code: "export default 'ice cream';",
        validator: true
    });

    t.comment("Adding barbeque dependency to childFork2");
    childFork2.addDependency({
        name: "barbeque",
        code: "export default 'spicy barbeque';",
        validator: true
    });

    t.absent(parentDeps["chocolate"], "Dependencies (including installed ones) added to a fork does not add to the " +
        "parent fork. Use parent.merge(child) to attain a child's or alien stage's deps.");

    t.absent(parentDeps["barbeque"], "Dependencies (including installed ones) added to a fork does not add to the " +
        "parent fork. Use parent.merge(child) to attain a child's or alien stage's deps.");

    t.is(child1Deps["chocolate"].cradle.code, "export default 'ice cream';", "Chocolate ice cream was added to child 1");
    t.absent(child2Deps["chocolate"], "Chocolate ice cream was not added to child 2");

    t.absent(child1Deps["barbeque"], "Spicy barbeque was not added to child 1");
    t.is(child2Deps["barbeque"].cradle.code, "export default 'spicy barbeque';", "Spicy barbeque was added to child 2");

    t.comment(`Adding dependency to parent, the forks will attain the parent dependency. UNLESS the child fork already has
    a dependency with the same name which allows for overriding down the tree`);

    parentFork.addDependency({
        name: "onion rings",
        code: "export default 'with spicy ranch';",
        validator: true
    });

    await parentFork.install();

    t.comment("Installing childForks");

    await childFork1.install();
    await childFork2.install();

    t.is(child1Deps["onion rings"].cradle.module, "with spicy ranch", "child1 acquired parent dep addition.");
    t.is(child2Deps["onion rings"].cradle.module, "with spicy ranch", "child2 acquired parent dep addition.");
    t.is(child1Deps["chocolate"].cradle.module, "ice cream");
    t.absent(parentDeps["chocolate"]?.cradle?.module, "installing forked stage will not install into the parent.");
    t.comment("Disposing childFork1");

    await childFork1.container.dispose();
    const [childFork2FromParentForks, nothingMore] = parentFork.forks

    t.is(childFork2FromParentForks.id, childFork2.id, "Disposed dependency is removed from parent fork leaving only the child2 fork");
    t.absent(nothingMore, "No other fork but child2");
    const {chocolate: child1Chocolate, ["hot-sauce"]: child1HotSauce} = childFork1.dependencies;
    t.absent(child1Chocolate, "chocolate ice cream isn't installed in childFork1 after it was disposed.");
    t.absent(child1HotSauce, "Hot sauce is gone.");

    t.comment("Disposing parentFork");
    t.alike(stage.forks, [parentFork], "Before disposing, stage.forks should have parent fork as its only entry.");
    await parentFork.container.dispose();
    t.alike(stage.forks, [], "At this point, root stage has no dependencies because parentFork was its only one.");
    t.absent(
        parentFork.dependencies["hot-sauce"]?.module &&
        parentFork.dependencies["hot-sauce"]?.installed,
        "disposing of a parent does not dispose the forks.."
    );

    t.absent(childFork1.dependencies["chocolate"], "childFork1 was disposed earlier and thus the chocolate dependency is gone.");
    t.absent(childFork1.dependencies["hot-sauce"], `childFork1 Hot sauce is gone.`);
    t.comment("Disposing childFork1");
    await childFork1.container.dispose();

    t.absent(childFork1.dependencies["hot-sauce"], `childFork1 dispose clears it's own deps.`);
    t.ok(childFork2.dependencies["barbeque"], "sibling childFork2 still has the dep barbeque.");
    t.ok(childFork2.dependencies["hot-sauce"], "sibling childFork2 still has the dep it inherited from the now disposed parent fork.");

    t.comment("Disposing childFork2");
    await childFork2.container.dispose();
    t.absent(childFork2.dependencies["barbeque"], "sibling childFork2 does not have the barbeque dep anymore.");
    t.absent(childFork2.dependencies["hot-sauce"], "sibling childFork2 does not have the hot-sauce dep anymore.");
    t.alike(parentFork.dependencies, {}, "At this point, the parentFork should have no dependencies.");
    t.alike(parentFork.forks, [], "At this point, the parentFork should have no forks.");
});

test("Alien vs Aircraft carrier (alien forks)", async t => {
    t.comment("Alien forks are forks from other libraries that use the dependency-staging library");

    alien.addDependency(motherShipData);
    stage.addDependency(airCraftCarrierData)

    await alien.install(false);
    await stage.install(false);

    alien.merge(stage);

    const aircraftCarrier = alien.dependencies["aircraft carrier"].cradle;
    const motherShip =  alien.dependencies["mothership"].cradle;

    t.ok(aircraftCarrier.installed, "Dependencies installed on alien fork will be installed on the fork it was merged to.");
    const {module: {nuclear, rocket}} = aircraftCarrier;
    const {module: {littleGun, bigGun}} = motherShip;

    let setDestroyed;
    let whenDestroyed = new Promise(resolve => setDestroyed = resolve);
    let destroyed = 0;
    let record = {};
    console.log(`${(await battle()).name} %cdestroyed`, "background-color: red; color:black; font-weight: bold");
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
    t.alike(alien.dependencies, {["aircraft carrier"]: aircraftCarrier.container, mothership: motherShip.container}, "But the alien stage still has references to both ships.");

    alien.fork();
    stage.merge(alien);
    t.alike(stage.dependencies, {["aircraft carrier"]: aircraftCarrier.container, mothership: motherShip.container}, "We can merge alien back into stage and have the dependencies again.");

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