import jsdoc2md from "jsdoc-to-markdown"
import path from "path";
import LocalDrive from "localdrive";
import b4a from "b4a";
import {fileURLToPath} from "url";
const p = fileURLToPath(import.meta.url);
const __dirname = path.dirname(p);

// const storageDrive = new LocalDrive(_.path.resolve(__dirname, ".."));
const projectFolder = new LocalDrive(path.resolve(__dirname, "./"));

try {
        await jsdoc2md.render({files: "./lib/**/*.js"}).then(
            data => {
                data = `
### Dependency Staging API
${data}`;
                return projectFolder.put(`./docs/api.md`, b4a.from(data));
            }
        );

    console.log("Docs created.");
} catch (e) {
    console.error(e);
}
