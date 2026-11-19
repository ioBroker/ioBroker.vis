import {
    existsSync,
    lstatSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmdirSync,
    unlinkSync,
    writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

export type VisWidgetSet = string | { name: string; depends?: string[]; always?: boolean };

export interface VisConfig {
    widgetSets: VisWidgetSet[];
}

interface WidgetSetPackage {
    path: string;
    name: string;
    pack?: { native?: { always?: boolean; dependencies?: string[] } } | null;
}

// this file is compiled to build/lib/install.js, the adapter directory is two levels higher
const adapterDir = join(__dirname, '..', '..');

function copyFileSync(source: string, target: string): void {
    let targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (existsSync(target)) {
        if (lstatSync(target).isDirectory()) {
            targetFile = join(target, basename(source));
        }
    }

    writeFileSync(targetFile, readFileSync(source));
}

function copyFolderRecursiveSync(source: string, target: string): void {
    //check if folder needs to be created or integrated
    const targetFolder = join(target, basename(source));
    if (!existsSync(targetFolder)) {
        mkdirSync(targetFolder);
    }

    //copy
    if (lstatSync(source).isDirectory()) {
        const files = readdirSync(source);
        files.forEach(file => {
            const curSource = join(source, file);
            if (lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

function deleteFolderRecursive(path: string): void {
    if (existsSync(path)) {
        const files = readdirSync(path);
        files.forEach(file => {
            const curPath = `${path}/${file}`;
            if (lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                unlinkSync(curPath);
            }
        });
        rmdirSync(path);
    }
}

const generic = ['basic', 'jqplot', 'jqui', 'tabs', 'swipe'];

const widgetSetsDependencies: Record<string, string[]> = {
    jqui: ['basic'],
};

/**
 * Copies the widgets of all installed widget set adapters into www/widgets, deletes the widget sets that
 * are not installed anymore and writes www/js/config.js.
 *
 * @param onlyLocal search the widget sets only in node_modules of vis (development)
 * @returns the new content of config.js or false if it did not change
 */
export function syncWidgetSets(onlyLocal?: boolean): string | false {
    let pack: WidgetSetPackage['pack'] = null;
    let found: boolean;
    let name: string;

    // find all installed widget sets
    const path = onlyLocal ? `${adapterDir}/node_modules/` : `${adapterDir}/../`;
    let dirs: string[];
    const sets: WidgetSetPackage[] = [];
    try {
        dirs = readdirSync(path);
        for (let d = 0; d < dirs.length; d++) {
            if (dirs[d].match(/^iobroker\./i) && existsSync(`${path + dirs[d]}/widgets/`)) {
                pack = null;
                try {
                    pack = JSON.parse(readFileSync(`${path + dirs[d]}/io-package.json`).toString());
                } catch (e) {
                    console.warn(`Cannot parse "${path}${dirs[d]}/io-package.json": ${e}`);
                }
                sets.push({ path: path + dirs[d], name: dirs[d].toLowerCase(), pack });
            }
        }
    } catch (e) {
        console.warn(`Cannot read "${path}": ${e}`);
    }
    if (!onlyLocal) {
        const outerDir = `${adapterDir}/../../../`;
        try {
            dirs = readdirSync(outerDir);
            for (let d = 0; d < dirs.length; d++) {
                if (dirs[d].match(/^iobroker\./i) && existsSync(`${outerDir}${dirs[d]}/widgets/`)) {
                    name = dirs[d].toLowerCase();
                    if (!sets.find(s => s.name === name)) {
                        pack = null;
                        try {
                            pack = JSON.parse(readFileSync(`${outerDir}${dirs[d]}/io-package.json`).toString());
                        } catch (e) {
                            console.warn(`Cannot parse "${outerDir}${dirs[d]}/io-package.json": ${e}`);
                        }
                        sets.push({ path: `${outerDir}${dirs[d]}`, name: dirs[d].toLowerCase() });
                    }
                }
            }
        } catch {
            // ignore
        }
    }

    // Now we have the list of widgets => copy them all to widgets directory
    for (let d = 0; d < sets.length; d++) {
        copyFolderRecursiveSync(`${sets[d].path}/widgets/`, `${adapterDir}/www/`);
    }
    const widgetSets: VisWidgetSet[] = [];

    // Read the list of installed widgets
    try {
        const installed = readdirSync(`${adapterDir}/www/widgets/`);
        for (let d = 0; d < installed.length; d++) {
            if (installed[d].match(/\.html$/)) {
                name = installed[d].replace('.html', '');
                const isGeneric = generic.includes(name);
                found = isGeneric;

                if (!found) {
                    found = !!sets.find(s => {
                        const ssName = s.name.toLowerCase();
                        return ssName === `iobroker.vis-${name}` || ssName === `iobroker.${name}`;
                    });
                }

                if (!found) {
                    // delete
                    unlinkSync(`${adapterDir}/www/widgets/${name}.html`);
                    if (existsSync(`${adapterDir}/www/widgets/${name}`)) {
                        deleteFolderRecursive(`${adapterDir}/www/widgets/${name}`);
                    }
                } else if (isGeneric) {
                    if (widgetSetsDependencies[name] && widgetSetsDependencies[name].length) {
                        widgetSets.push({ name, depends: widgetSetsDependencies[name] });
                    } else {
                        widgetSets.push(name);
                    }
                } else {
                    for (let g = 0; g < sets.length; g++) {
                        const sName = sets[g].name.toLowerCase();
                        if (sName === `iobroker.vis-${name}` || sName === `iobroker.${name}`) {
                            const native = sets[g].pack?.native;
                            if (native?.always) {
                                widgetSets.push({ name, always: true });
                            } else if (native?.dependencies) {
                                widgetSets.push({ name, depends: native.dependencies });
                            } else {
                                widgetSets.push(name);
                            }
                            break;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn(`Cannot read "${adapterDir}/www/widgets/": ${e}`);
    }

    // build config file
    const visConfig: VisConfig = { widgetSets };

    let text = `var visConfig = ${JSON.stringify(visConfig, null, 4)};\n`;
    text += "if (typeof exports !== 'undefined') {\n";
    text += '    exports.config = visConfig;\n';
    text += '} else {\n';
    text += '    visConfig.language = window.navigator.userLanguage || window.navigator.language;\n';
    text += '}\n';

    const oldText = readFileSync(`${adapterDir}/www/js/config.js`).toString();
    if (oldText !== text) {
        writeFileSync(`${adapterDir}/www/js/config.js`, text);
        return text;
    }
    return false;
}

// started directly: node build/lib/install.js
if (require.main === module) {
    syncWidgetSets();
}
