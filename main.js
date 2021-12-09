/**
 *
 *      iobroker vis Adapter
 *
 *      Copyright (c) 2014-2021, bluefox
 *      Copyright (c) 2014, hobbyquaker
 *
 *      CC-NC-BY 4.0 License
 *
 */
/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const adapterName    = require('./package.json').name.split('.').pop();
const isBeta         = adapterName.includes('beta');

const utils          = require('@iobroker/adapter-core'); // Get common adapter utils
const adapter        = new utils.Adapter(adapterName);
const fs             = require('fs');
const syncWidgetSets = require('./lib/install.js');
const https          = require('https');
const jwt            = require('jsonwebtoken');

adapter.on('ready', () => main());

async function writeFile(fileName) {
    const config = require(__dirname + '/www/js/config.js').config;
    let index;
    const srcFileNameParts = fileName.split('.');
    const ext = srcFileNameParts.pop();
    const srcFileName = srcFileNameParts.join('.') + '.src.' + ext;
    if (fs.existsSync(__dirname + '/www/' + srcFileName)) {
        index = fs.readFileSync(__dirname + '/www/' + srcFileName).toString();
    } else {
        index = fs.readFileSync(__dirname + '/www/' + fileName).toString();
        fs.writeFileSync(__dirname + '/www/' + srcFileName, index);
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
            name = config.widgetSets[w].name + '.html';
        } else {
            name = config.widgetSets[w] + '.html';
        }
        file = fs.readFileSync(__dirname + '/www/widgets/' + name);
        // extract all css and js


        bigInsert += '<!-- --------------' + name + '--- START -->\n' + file.toString() + '\n<!-- --------------' + name + '--- END -->\n';
    }
    let pos = index.indexOf(begin);
    if (pos !== -1) {
        const start = index.substring(0, pos + begin.length);
        pos = index.indexOf(end);
        if (pos !== -1) {
            const _end = index.substring(pos);
            index = start + '\n' + bigInsert + '\n' + _end;

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

            const data = await adapter.readFileAsync(adapterName, fileName);
            if (data && data !== index) {
                fs.writeFileSync(__dirname + '/www/' + fileName, index);
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
        const file = utils.controllerDir + '/iobroker.js';
        const child = require('child_process').spawn('node', [file, 'upload', adapter.name, 'widgets']);
        let count = 0;
        child.stdout.on('data', data => {
            count++;
            adapter.log.debug(data.toString().replace('\n', ''));
            !(count % 100) && adapter.log.info(count + ' files uploaded...');
        });

        child.stderr.on('data', data =>
            adapter.log.error(data.toString().replace('\n', '')));

        child.on('exit', exitCode => {
            adapter.log.info(`Uploaded. ${exitCode ? 'Exit - ' + exitCode : 0}`);
            resolve(exitCode);
        });
    });
}

async function updateCacheManifest() {
    adapter.log.info('Changes in index.html detected => update cache.manifest');
    let data = fs.readFileSync(__dirname + '/www/cache.manifest').toString();
    const build = data.match(/# dev build ([0-9]+)/);
    data = data.replace(/# dev build [0-9]+/, '# dev build ' + (parseInt(build[1] || 0, 10) + 1));
    fs.writeFileSync(__dirname + '/www/cache.manifest', data);

    await adapter.writeFileAsync(adapterName, 'cache.manifest', data);
}

// Update index.html
async function checkFiles(configChanged, isBeta) {
    if (isBeta) {
        return adapter.stop();
    }
    const indexChanged = await writeFile('index.html');
    // Update edit.html
    const editChanged = await writeFile('edit.html');
    if (indexChanged || editChanged || configChanged) {
        await updateCacheManifest();
        await upload();
    }

    adapter.stop();
}

async function copyFiles(root, filesOrDirs) {
    if (!filesOrDirs) {
        try {
            const filesOrDirs = await adapter.readDirAsync('vis.0', root);
            await copyFiles(root, filesOrDirs || []);
        } catch (err) {
            adapter.log.warn(`Cannot read directory ${root}: ${err.message}`);
        }
    }

    if (!filesOrDirs || !filesOrDirs.length) {
        return;
    }

    for (let f = 0; f < filesOrDirs.length; f++) {
        const task = filesOrDirs[f];
        if (task.isDir) {
            await copyFiles(root + task.file + '/');
        } else {
            try {
                const data = await adapter.readFileAsync('vis.0', root + task.file);
                if (data || data === 0 || data === '') {
                    await adapter.writeFileAsync(adapterName + '.0', root + task.file, data);
                }
            } catch (err) {
                adapter.log.warn(`Cannot copy file vis.0/${root + task.file} to ${adapterName + '.0'}/${root + task.file}: ${err.message}`);
            }
        }
    }
}

async function generatePages(isLicenseError) {
    let changed = false;

    if (!isBeta) {
        changed = !!syncWidgetSets(false, isLicenseError);

        // upload config.js
        let data = await adapter.readFileAsync(adapterName, 'js/config.js');
        const config = fs.existsSync(__dirname + '/www/js/config.js') ? fs.readFileSync(__dirname + '/www/js/config.js').toString('utf8') : '';
        data = data ? data.toString('utf8') : '';
        if (!data || data !== config) {
            changed = true;
            adapter.log.info('config.js changed. Upload.');
            await adapter.writeFileAsync(adapterName, 'js/config.js', config);
        }
    } else {
        // try to read vis-beta.0/files
        const dirs = await adapter.readDirAsync(adapterName + '.0', '/');
        if (!dirs || !dirs.length) {
            // copy all directories
            await copyFiles('/', null);
        }
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
    try {
        const data = await adapter.readFileAsync(adapterName, 'css/vis-common-user.css');
        if (data === null || data === undefined) {
            await adapter.writeFileAsync(adapterName, 'css/vis-common-user.css', '');
        }
    } catch (err) {
        await adapter.writeFileAsync(adapterName, 'css/vis-common-user.css', '');
    }

    await checkFiles(changed, isBeta);
}

async function indicateError() {
    let data = fs.readFileSync(__dirname + '/www/js/config.js').toString();
    if (!data.includes('license: false,')) {
        data = data.replace('const visConfig = {', 'const visConfig = {license: false,');
        fs.writeFileSync(__dirname + '/www/js/config.js', data);

        await adapter.writeFileAsync(adapterName, 'js/config.js', data);
        await updateCacheManifest();
    }
}

// delete this function as js.controller 4.0 will be mainstream
async function getSuitableLicenses(all) {
    if (adapter.getSuitableLicenses) {
        return adapter.getSuitableLicenses(all);
    } else {
        const licenses = [];
        try {
            const obj = await adapter.getForeignObjectAsync('system.licenses');
            if (obj && obj.native && obj.native.licenses && obj.native.licenses.length) {
                const now = Date.now();
                const cert = fs.readFileSync(__dirname + '/lib/cloudCert.crt');
                const version = adapter.pack.version.split('.')[0];

                obj.native.licenses.forEach(license => {
                    try {
                        const decoded = jwt.verify(license.json, cert);
                        if (decoded.name && (!decoded.valid_till || license.valid_till === '0000-00-00 00:00:00' || new Date(license.valid_till).getTime() > now)) {
                            if (decoded.name.startsWith('iobroker.' + adapter.name) && (all || !license.usedBy || license.usedBy === adapter.namespace)) {
                                if (decoded.version === '<2' || decoded.version === '<1' || decoded.version === '<=1') {
                                    if (version !== '0' && version !== '1') {
                                        return;
                                    }
                                } else if (decoded.version && decoded.version !== version) {
                                    return;
                                }
                                // remove free license if commercial license found
                                if (decoded.invoice !== 'free') {
                                    const pos = licenses.findIndex(item => item.invoice === 'free');
                                    pos !== -1 && licenses.splice(pos, 1);
                                }
                                license.decoded = decoded;
                                licenses.push(license);
                            }
                        }
                    } catch (err) {
                        adapter.log.error(`Cannot decode license "${license.name}": ${err.message}`);
                    }
                });
            }
        } catch {
            // ignore
        }

        return licenses;
    }
}

function checkLicense(license, uuid, originalError) {
    if (license && license.expires * 1000 < new Date().getTime()) {
        adapter.log.error(`Cannot check license: Expired on ${new Date(license.expires * 1000).toString()}`);
        adapter.stop();
        return true;
    } else if (!license) {
        adapter.log.error(`Cannot check license: License is empty${originalError ? ' and ' + originalError : ''}`);
        return true;
    } else if (uuid.length !== 36) {
        if (license.invoice === 'free') {
            adapter.log.error('Cannot use free license with commercial device!');
            return true;
        } else {
            return false;
        }
    } else {
        const code = [];
        for (let i = 0; i < license.type.length; i++) {
            code.push('\\u00' + license.type.charCodeAt(i).toString(16));
        }

        if (code.join('') !== '\u0063\u006f\u006d\u006d\u0065\u0072\u0063\u0069\u0061\u006c') {
            return false;
        } else {
            originalError && adapter.log.error('Cannot check license: ' + originalError);
            return true;
        }
    }
}

function check(license, uuid, originalError) {
    try {
        const decoded = jwt.verify(license, fs.readFileSync(__dirname + '/lib/cloudCert.crt'));
        return checkLicense(decoded, uuid, originalError);
    } catch (err) {
        adapter.log.error('Cannot check license: ' + originalError);
        return true
    }
}

function doLicense(license, uuid) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({json: license, uuid});

        // An object of options to indicate where to post to
        const postOptions = {
            host: 'iobroker.net',
            path: '/api/v1/public/cert/',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        // Set up the request
        const postReq = https.request(postOptions, res => {
            res.setEncoding('utf8');
            let result = '';
            res.on('data', chunk => result += chunk);

            res.on('end', async () => {
                try {
                    const data = JSON.parse(result);
                    if (data.result === 'OK') {
                        if (uuid.length !== 36 && uuid.substring(0, 2) !== 'IO') {
                            try {
                                const decoded = jwt.verify(license, fs.readFileSync(__dirname + '/lib/cloudCert.crt'));
                                if (!decoded || decoded.invoice === 'free') {
                                    adapter.log.error('Cannot use free license with commercial device!');
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            } catch (err) {
                                adapter.log.error('Cannot check license: ' + err);
                                resolve(true);
                            }
                        } else {
                            adapter.log.info('vis license is OK.');
                            resolve();
                        }
                    } else {
                        await indicateError();
                        adapter.log.error(`License is invalid! Nothing updated. Error: ${data ? data.result : 'unknown'}`);
                        resolve(true);
                    }
                } catch (err) {
                    reject(err);
                }
            });

            res.on('error', err => reject(err));
        })
            .on('error', err => reject(err));

        postReq.write(data);
        postReq.end();
    })
}

async function main() {
    // first of all check license
    if (!adapter.config.useLicenseManager && (!adapter.config.license || typeof adapter.config.license !== 'string')) {
        await indicateError();
        adapter.log.error('No license found for vis. Please get one on https://iobroker.net !');
        await generatePages(true);
    } else {
        const uuidObj = await adapter.getForeignObjectAsync('system.meta.uuid');
        if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
            await indicateError();
            adapter.log.error('UUID not found!');
            await generatePages(true);
        } else {
            let license = adapter.config.license;
            if (adapter.config.useLicenseManager) {
                license = await getSuitableLicenses();
                license = license[0] && license[0].json;
            }

            if (!license) {
                await indicateError();
                adapter.log.error('No license found for vis. Please get one on https://iobroker.net !');
                await generatePages(true);
            } else {
                let isLicenseError;

                try {
                    isLicenseError = await doLicense(license, uuidObj.native.uuid);
                } catch (err) {
                    isLicenseError = check(license, uuidObj.native.uuid, err);
                }

                await generatePages(isLicenseError);
            }
        }
    }
}
