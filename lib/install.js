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

function copyFileSync(source, target) {
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
        !type && console.log('Unknown file type: ' + source);
        if (newFile.byteLength !== oldFile.byteLength) {
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

function copyFolderRecursiveSync(source, target) {
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
                if (copyFolderRecursiveSync(curSource, targetFolder)) {
                    changed = true;
                }
            } else {
                if (copyFileSync(curSource, targetFolder)) {
                    changed = true;
                }
            }
        });

        // Delete all old files
        if (target !== `${__dirname}/../www/`) {
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
            const curPath = dirPath + '/' + file;
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

function syncWidgetSets(onlyLocal, enabledList) {
    let pack = null;
    let filesChanged = false;
    let found;
    let name;
    let path;

    // find all installed widget sets
    if (onlyLocal) {
        path = __dirname + '/../node_modules/';
    } else {
        path = __dirname + '/../../';
    }
    let dirs = fs.readdirSync(path);
    const sets = [];
    for (let d = 0; d < dirs.length; d++) {
        if (dirs[d].match(/^iobroker\./i) && fs.existsSync(path + dirs[d] + '/widgets/')) {
            pack = null;
            try {
                pack = JSON.parse(fs.readFileSync(path + dirs[d] + '/io-package.json').toString());
            } catch (e) {
                console.warn(`Cannot parse "${path}${dirs[d]}/io-package.json": ${e}`);
            }
            sets.push({path: path + dirs[d], name: dirs[d].toLowerCase(), pack: pack});
        }
    }
    if (!onlyLocal) {
        try {
            dirs = fs.readdirSync(__dirname + '/../../../../');
            for (let d = 0; d < dirs.length; d++) {
                if (dirs[d].match(/^iobroker\./i) && fs.existsSync(`${__dirname}/../../../../${dirs[d]}/widgets/`)) {
                    found = false;
                    name = dirs[d].toLowerCase();
                    for (let s = 0; s < sets.length; s++) {
                        if (sets[s].name === name) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        pack = null;
                        try {
                            pack = JSON.parse(fs.readFileSync(`${__dirname}/../../../../${dirs[d]}/io-package.json`).toString());
                        } catch (e) {
                            console.warn(`Cannot parse "${__dirname}/../../../../${dirs[d]}/io-package.json": ${e}`);
                        }
                        sets.push({path: `${__dirname}/../../../../${dirs[d]}`, name: dirs[d].toLowerCase()});
                    }
                }
            }
        } catch (e) {

        }
    }

    // Now we have the list of widgets => copy them all to widgets directory
    for (let d = 0; d < sets.length; d++) {
        if (enabledList && !enabledList.includes(sets[d].name.replace('iobroker.', ''))) {
            continue;
        }
        let _changed = copyFolderRecursiveSync(`${sets[d].path}/widgets/`, `${__dirname}/../www/`);
        if (_changed) {
            filesChanged = true;
        }
        console.log(`Check ${sets[d].path.replace(/\\/g, '/').split('/').pop()}... ${_changed ? 'copied.' : 'no changes.'}`);
    }

    const widgetSets = [];

    // Read the list of installed widgets
    const installed = fs.readdirSync(__dirname + '/../www/widgets/');
    for (let d = 0; d < installed.length; d++) {
        if (installed[d].match(/\.html$/)) {
            name = installed[d].replace('.html', '');
            const isGeneric = generic.includes(name);
            found = isGeneric;

            if (!found) {
                for (let b = 0; b < sets.length; b++) {
                    const ssName = sets[b].name.toLowerCase();
                    if (ssName === 'iobroker.vis-' + name || ssName === 'iobroker.' + name) {
                        if (enabledList && !enabledList.includes(ssName.replace('iobroker.', ''))) {
                            continue;
                        }
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                filesChanged = true;
                //delete
                fs.unlinkSync(`${__dirname}/../www/widgets/${name}.html`);
                if (fs.existsSync(`${__dirname}/../www/widgets/${name}`)) {
                    deleteFolderRecursive(`${__dirname}/../www/widgets/${name}`);
                }
            } else {
                if (isGeneric) {
                    if (widgetSetsDependencies[name] && widgetSetsDependencies[name].length) {
                        widgetSets.push({name, depends: widgetSetsDependencies[name]});
                    } else {
                        widgetSets.push(name);
                    }
                } else {
                    for (let g = 0; g < sets.length; g++) {
                        const sName = sets[g].name.toLowerCase();
                        if (sName === 'iobroker.vis-' + name || sName === 'iobroker.' + name) {
                            if (sets[g].pack && sets[g].pack.native && sets[g].pack.native.always) {
                                widgetSets.push({name, always: true});
                            } else if (sets[g].pack && sets[g].pack.native && sets[g].pack.native.dependencies) {
                                widgetSets.push({name, depends: sets[g].pack.native.dependencies});
                            } else {
                                widgetSets.push(name);
                            }
                            break;
                        }
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
