'use strict';

const fs   = require('fs');
const path = require('path');
const mime = require('mime');
const crypto = require('crypto');

const TEXT_TYPES = [
    'application/json',
    'application/javascript',
    'image/svg+xml',
];

function copyFileSync(source, target, forceBuild) {
    let targetFile = target;
    let changed = false;

    // if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    if (fs.existsSync(targetFile)) {
        const newFile = fs.readFileSync(source);
        const oldFile = fs.readFileSync(targetFile);
        const type = mime.getType(source);
        !type && console.log(`Unknown file type: ${source}`);
        if (newFile.byteLength !== oldFile.byteLength || forceBuild) {
            changed = true;
            fs.writeFileSync(targetFile, newFile);
        } else if (type && (type.startsWith('text/') || TEXT_TYPES.includes(type))) {
            if (newFile.toString('utf8') !== oldFile.toString('utf8')) {
                changed = true;
                fs.writeFileSync(targetFile, newFile);
            }
        } else {
            const hashSumOld = crypto.createHash('sha256');
            hashSumOld.update(oldFile);
            const hexOld = hashSumOld.digest('hex');

            const hashSumNew = crypto.createHash('sha256');
            hashSumNew.update(newFile);
            const hexNew = hashSumNew.digest('hex');

            if (hexNew !== hexOld) {
                changed = true;
                fs.writeFileSync(targetFile, newFile);
            }
        }
    } else {
        changed = true;
        fs.writeFileSync(targetFile, fs.readFileSync(source));
    }

    return changed;
}

function copyFolderRecursiveSync(source, target, forceBuild) {
    let oldFiles = [];
    let files = [];
    let changed = false;

    // check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    // copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        oldFiles = fs.readdirSync(targetFolder);

        files.forEach(file => {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                if (copyFolderRecursiveSync(curSource, targetFolder, forceBuild)) {
                    changed = true;
                }
            } else {
                if (copyFileSync(curSource, targetFolder, forceBuild)) {
                    changed = true;
                }
            }
        });

        // Delete all old files
        if (target !== path.normalize(`${__dirname}/../www/`)) {
            oldFiles
                .forEach(file => {
                    const pathName = path.join(targetFolder, file);
                    if (!files.includes(file) && !fs.lstatSync(pathName).isDirectory()) {
                        fs.unlinkSync(pathName);
                        changed = true;
                    }
                });
        }
    }

    return changed;
}

function deleteFolderRecursive(dirPath) {
    let files = [];
    if (fs.existsSync(dirPath)) {
        files = fs.readdirSync(dirPath);
        files.forEach((file, index) => {
            const curPath = `${dirPath}/${file}`;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

const generic = [
    'basic',
    'jqplot',
    'jqui',
    'swipe',
    'tabs'
];

const widgetSetsDependencies = {
    jqui: ['basic']
};

function syncWidgetSets(enabledList, forceBuild) {
    let filesChanged = false;
    let found;
    let name;

    // Now we have the list of widgets => copy them all to widgets directory
    for (let d = 0; d < enabledList.length; d++) {
        let _changed = copyFolderRecursiveSync(`${enabledList[d].path}/widgets/`, path.normalize(`${__dirname}/../www/`, forceBuild));
        if (_changed) {
            filesChanged = true;
        }
        console.log(`Check ${enabledList[d].path.replace(/\\/g, '/').split('/').pop()}... ${_changed ? 'COPIED.' : 'no changes.'}`);
    }

    const widgetSets = [];

    // Read the list of installed widgets
    const installed = fs.readdirSync(`${__dirname}/../www/widgets/`);
    for (let d = 0; d < installed.length; d++) {
        if (installed[d].match(/\.html$/)) {
            name = installed[d].replace('.html', '');
            const isGeneric = generic.includes(name);
            found = isGeneric;

            if (!found) {
                found = enabledList.find(w => w.name.toLowerCase() === `iobroker.vis-${name}` || w.name.toLowerCase() === `iobroker.${name}`);
            }

            if (!found) {
                filesChanged = true;
                // delete
                fs.unlinkSync(`${__dirname}/../www/widgets/${name}.html`);
                if (fs.existsSync(`${__dirname}/../www/widgets/${name}`)) {
                    deleteFolderRecursive(path.normalize(`${__dirname}/../www/widgets/${name}`));
                }
            } else {
                if (isGeneric) {
                    if (widgetSetsDependencies[name] && widgetSetsDependencies[name].length) {
                        widgetSets.push({name, depends: widgetSetsDependencies[name]});
                    } else {
                        widgetSets.push(name);
                    }
                } else {
                    if (found.pack && found.pack.native && found.pack.native.always) {
                        widgetSets.push({name, always: true});
                    } else if (found.pack && found.pack.native && found.pack.native.dependencies && found.pack.native.dependencies.length) {
                        widgetSets.push({name, depends: found.pack.native.dependencies});
                    } else {
                        widgetSets.push(name);
                    }
                }
            }
        }
    }

    return {widgetSets, filesChanged};
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports = syncWidgetSets;
} else {
    syncWidgetSets();
}
