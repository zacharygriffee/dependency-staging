import {extend} from "simplified-awilix/lib/extend.js";

export class DependencyError extends Error {
    constructor(message) {
        super(message)
    }
}

export class DependencyIsNotInstalledError extends DependencyError {
    constructor(name) {
        super(`Dependency "${name}" is not installed.`);
        this.dependency = name;
    }
}

export class DependencyCouldNotBeInstalled extends DependencyError {
    constructor(name, error) {
        super(`Dependency "${name}" could not be installed because ${error.message}`);
        this.dependency = name;
        this.error = error;
    }
}

export class DependencyCouldNotBeResolved extends DependencyIsNotInstalledError {
    constructor(name, error) {
        super(`A non-optional dependency "${name}" could not be resolved.`);
        this.dependency = name;
        this.error = error;
    }
}

export class DependencyCouldNotBeAdded extends DependencyError {
    constructor(name, reason) {
        super(`"${name}" dependency could not be added because ${reason}`);
    }
}

export class DependencyCouldNotBeValidated extends DependencyError {
    constructor(name, reason) {
        super(`"${name}" could not be validated ${reason ? "because " + reason?.message || reason : ""}`);
    }
}

export class InstallationError extends Error {
    constructor(name, error) {
        super(`Installation error of "${name}" because ` + (error?.message || error));
    }
}

export class MultipleErrors extends Error {
    constructor(header, list) {
        const messages = list.map(o => o?.message || o).join("\n\r - ");

        console.error(`
        ${header}
        Multiple Errors:
        ${messages}
        `);

        super(header);
    }
}

export class StageMergeError extends Error {
    constructor(thisId, thatId, reason) {
        super(`Stage Merger Error initiator stage: ${thisId} cannot receive merge of target stage: ${thisId} because: ${reason}`);
    }
}