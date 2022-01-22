'use strict';

const fs   = require('fs');
const path = require('path');

function copyFileSync(source, target) {
    let targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
    let files = [];

    //check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach(file => {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

function deleteFolderRecursive (path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            const curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

const generic = [
    'basic',
    'jqplot',
    'jqui',
    'tabs',
    'swipe'
];

const widgetSetsDependencies = {
    jqui:        ['basic']
};

function syncWidgetSets(onlyLocal, isLicenseError) {
    if (process.argv.includes('--beta')) {
        return;
    }

    let pack = null;
    let changed = false;
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
        copyFolderRecursiveSync(sets[d].path + '/widgets/', __dirname + '/../www/');
    }
    const widgetSets = [];

    // Read the list of installed widgets
    const installed = fs.readdirSync(__dirname + '/../www/widgets/');
    for (let d = 0; d < installed.length; d++) {
        if (installed[d].match(/\.html$/)) {
            name = installed[d].replace('.html', '');
            const isGeneric = generic.indexOf(name) !== -1;
            found = isGeneric;

            if (!found) {
                for (let b = 0; b < sets.length; b++) {
                    const ssName = sets[b].name.toLowerCase();
                    if (ssName === 'iobroker.vis-' + name || ssName === 'iobroker.' + name) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                changed = true;
                //delete
                fs.unlinkSync(`${__dirname}/../www/widgets/${name}.html`);
                if (fs.existsSync(`${__dirname}/../www/widgets/${name}`)) {
                    deleteFolderRecursive(`${__dirname}/../www/widgets/${name}`);
                }
            }
            else {
                if (isGeneric) {
                    if (widgetSetsDependencies[name] && widgetSetsDependencies[name].length) {
                        widgetSets.push({name: name, depends: widgetSetsDependencies[name]});
                    } else {
                        widgetSets.push(name);
                    }
                } else {
                    for (let g = 0; g < sets.length; g++) {
                        const sName = sets[g].name.toLowerCase();
                        if (sName === 'iobroker.vis-' + name || sName === 'iobroker.' + name) {
                            if (sets[g].pack && sets[g].pack.native && sets[g].pack.native.always) {
                                widgetSets.push({name: name, always: true});
                            } else if (sets[g].pack && sets[g].pack.native && sets[g].pack.native.dependencies) {
                                widgetSets.push({name: name, depends: sets[g].pack.native.dependencies});
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

    // build config file
    const visConfig = { widgetSets };

    let text = 'var visConfig = ' + JSON.stringify(visConfig, null, 4) + ';\n';
    if (isLicenseError) {
        text = text.replace('var visConfig = {', 'var visConfig = {license: false,');
    }
    text += 'if (typeof exports !== \'undefined\') {\n';
    text += '    exports.config = visConfig;\n';
    text += '} else {\n';
    text += '    visConfig.language = window.navigator.userLanguage || window.navigator.language;\n';
    text += '}\n';

    const oldText = fs.readFileSync(__dirname + '/../www/js/config.js').toString();
    if (oldText !== text) {
        fs.writeFileSync(__dirname + '/../www/js/config.js', text);
        return text;
    } else {
        return false;
    }
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports = syncWidgetSets;
} else {
    syncWidgetSets();
}
