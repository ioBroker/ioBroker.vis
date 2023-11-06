/**
 *
 *      iobroker vis Adapter (version 1). ioBroker.vis-2 is another adapter and has another license.
 *
 *      Copyright (c) 2014-2023, bluefox
 *      Copyright (c) 2014, hobbyquaker
 *
 *      MIT License
 *
 */
/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const adapterName = require('./package.json').name.split('.').pop();

const utils = require('@iobroker/adapter-core'); // Get common adapter utils
const fs = require('fs');
const path = require('path');
const syncWidgetSets = require('./lib/install.js');
let adapter;

function startAdapter(options) {
    options = options || {};

    Object.assign(options, {
        name: adapterName,
        ready: () => main()
    });

    adapter = new utils.Adapter(options);

    return adapter;
}

async function writeFile(fileName) {
    const config = require(`${__dirname}/www/js/config.js`).config;
    let index;
    const srcFileNameParts = fileName.split('.');
    const ext = srcFileNameParts.pop();
    const srcFileName = `${srcFileNameParts.join('.')}.src.${ext}`;
    if (fs.existsSync(`${__dirname}/www/${srcFileName}`)) {
        index = fs.readFileSync(`${__dirname}/www/${srcFileName}`).toString();
    } else {
        index = fs.readFileSync(`${__dirname}/www/${fileName}`).toString();
        fs.writeFileSync(`${__dirname}/www/${srcFileName}`, index);
    }

    // enable cache
    index = index.replace('<!--html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html"--><html>',
        '<html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html">');

    const begin = '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - BEGIN ------------------------------------------- -->';
    const end   = '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - END   ------------------------------------------- -->';
    let bigInsert = '';
    for (const w in config.widgetSets) {
        if (!config.widgetSets.hasOwnProperty(w)) continue;
        let file;
        let name;

        if (typeof config.widgetSets[w] === 'object') {
            name = `${config.widgetSets[w].name}.html`;
        } else {
            name = `${config.widgetSets[w]}.html`;
        }
        file = fs.readFileSync(`${__dirname}/www/widgets/${name}`);
        // extract all css and js


        bigInsert += `<!-- --------------${name}--- START -->\n${file.toString()}\n<!-- --------------${name}--- END -->\n`;
    }
    let pos = index.indexOf(begin);
    if (pos !== -1) {
        const start = index.substring(0, pos + begin.length);
        pos = index.indexOf(end);
        if (pos !== -1) {
            const _end = index.substring(pos);
            index = `${start}\n${bigInsert}\n${_end}`;

            /*index = minify(index, {
                removeAttributeQuotes: true,
                removeComments: true,
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                decodeEntities: true,
                minifyCSS: true,
                minifyJS: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            });*/
            let data;
            try {
                data = await adapter.readFileAsync(adapterName, fileName);
            } catch (err) {
                // ignore
            }
            if (typeof data === 'object') {
                data = data.file;
            }
            if (data && data !== index) {
                fs.writeFileSync(`${__dirname}/www/${fileName}`, index);
                await adapter.writeFileAsync(adapterName, fileName, index);
                return true;
            }
        }
    }
    return false;
}

function upload() {
    return new Promise(resolve => {
        adapter.log.info(`Upload ${adapter.name} anew, while changes detected...`);

        const file = path.join(utils.controllerDir, 'iobroker.js');
        const child = require('child_process').spawn('node', [file, 'upload', adapter.name, 'widgets']);
        let count = 0;
        child.stdout.on('data', data => {
            count++;
            adapter.log.debug(data.toString().replace('\n', ''));
            !(count % 100) && adapter.log.info(`${count} files uploaded...`);
        });

        child.stderr.on('data', data =>
            adapter.log.error(data.toString().replace('\n', '')));

        child.on('exit', exitCode => {
            adapter.log.info(`Uploaded. ${exitCode ? `Exit - ${exitCode}` : 0}`);
            resolve(exitCode);
        });
    });
}

async function updateCacheManifest() {
    adapter.log.info('Changes in index.html detected => update cache.manifest');
    let data = fs.readFileSync(`${__dirname}/www/cache.manifest`).toString();
    const build = data.match(/# dev build ([0-9]+)/);
    data = data.replace(/# dev build [0-9]+/, `# dev build ${parseInt(build[1] || 0, 10) + 1}`);
    fs.writeFileSync(`${__dirname}/www/cache.manifest`, data);

    await adapter.writeFileAsync(adapterName, 'cache.manifest', data);
}

// Update index.html
async function checkFiles(configChanged) {
    const indexChanged = await writeFile('index.html');
    // Update edit.html
    const editChanged = await writeFile('edit.html');
    if (indexChanged || editChanged || configChanged) {
        await updateCacheManifest();
        await upload();
    }
}

async function generatePages() {
    let changed = !!syncWidgetSets(false);

    // upload config.js
    let data = await adapter.readFileAsync(adapterName, 'js/config.js');
    if (typeof data === 'object') {
        data = data.file;
    }
    const config = fs.existsSync(`${__dirname}/www/js/config.js`) ? fs.readFileSync(`${__dirname}/www/js/config.js`).toString('utf8') : '';
    data = data ? data.toString('utf8') : '';
    if (!data || data !== config) {
        changed = true;
        adapter.log.info('config.js changed. Upload.');
        await adapter.writeFileAsync(adapterName, 'js/config.js', config);
    }

    // create command variable
    const obj = await adapter.getObjectAsync('control.command');
    if (!obj) {
        await adapter.setObjectAsync('control.command',
        {
                type: 'state',
                common: {
                    name: 'Command for vis',
                    type: 'string',
                    desc: 'Writing this variable akt as the trigger. Instance and data must be preset before \'command\' will be written. \'changedView\' will be signalled too',
                    role: 'state',
                    states: {
                        alert: 'alert',
                        changeView: 'changeView',
                        refresh: 'refresh',
                        reload: 'reload',
                        dialog: 'dialog',
                        popup: 'popup',
                        playSound: 'playSound',
                        changedView: 'changedView',
                        tts: 'tts'
                    }
                },
                native: {}
            });
    }

    // Create common user CSS file
    let cssData;
    try {
        cssData = await adapter.readFileAsync(adapterName, 'css/vis-common-user.css');
        if (typeof cssData === 'object') {
            cssData = cssData.file;
        }
    } catch {
        cssData = null;
    }

    if (cssData === null || cssData === undefined) {
        await adapter.writeFileAsync(adapterName, 'css/vis-common-user.css', '');
    }

    return changed;
}

async function main() {
    const visObj = await adapter.getForeignObjectAsync(adapterName);
    if (!visObj || visObj.type !== 'meta') {
        await adapter.setForeignObjectAsync(adapterName, {
            type: 'meta',
            common: {
                name: 'user files and images for vis',
                type: 'meta.user',
            },
            native: {},
        });
    }

    const filesChanged = await generatePages();
    await checkFiles(filesChanged);
    adapter.stop();
}

// If started as allInOne mode => return function to create instance
// @ts-ignore
if (module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
