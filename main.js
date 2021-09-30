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
const isBeta         = adapterName.indexOf('beta') !== -1;

const utils          = require('@iobroker/adapter-core'); // Get common adapter utils
const adapter        = new utils.Adapter(adapterName);
const fs             = require('fs');
const syncWidgetSets = require('./lib/install.js');
const https          = require('https');
const jwt            = require('jsonwebtoken');
//const minify         = require('html-minifier').minify;

adapter.on('ready', () => main());

function writeFile(fileName, callback) {
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
            index    = start + '\n' + bigInsert + '\n' + _end;

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

            adapter.readFile(adapterName, fileName, (err, data) => {
                if (data && data !== index) {
                    fs.writeFileSync(__dirname + '/www/' + fileName, index);
                    adapter.writeFile(adapterName, fileName, index, () => callback && callback(true));
                } else if (callback) {
                    callback(false);
                }
            });
        } else if (callback) {
            callback(false);
        }
    } else if (callback) {
        callback(false);
    }
}

function upload(callback) {
    adapter.log.info('Upload ' + adapter.name + ' anew, while changes detected...');
    const file = utils.controllerDir + '/iobroker.js';
    const child = require('child_process').spawn('node', [file, 'upload', adapter.name, 'widgets']);
    let count = 0;
    child.stdout.on('data', data => {
        count++;
        adapter.log.debug(data.toString().replace('\n', ''));
        !(count % 100) && adapter.log.info(count + ' files uploaded...');
    });
    child.stderr.on('data', data => {
        adapter.log.error(data.toString().replace('\n', ''));
    });
    child.on('exit', exitCode => {
        adapter.log.info('Uploaded. ' + (exitCode ? 'Exit - ' + exitCode : 0));
        callback(exitCode);
    });
}

function updateCacheManifest(callback) {
    adapter.log.info('Changes in index.html detected => update cache.manifest');
    let data = fs.readFileSync(__dirname + '/www/cache.manifest').toString();
    const build = data.match(/# dev build ([0-9]+)/);
    data = data.replace(/# dev build [0-9]+/, '# dev build ' + (parseInt(build[1] || 0, 10) + 1));
    fs.writeFileSync(__dirname + '/www/cache.manifest', data);

    adapter.writeFile(adapterName, 'cache.manifest', data, () => callback && callback());
}
// Update index.html
function checkFiles(configChanged, isBeta) {
    if (isBeta) {
        adapter.stop();
        return;
    }
    writeFile('index.html', indexChanged => {
        // Update edit.html
        writeFile('edit.html', editChanged => {
            if (indexChanged || editChanged || configChanged) {
                updateCacheManifest(() =>
                    upload(() => adapter.stop()));
            } else {
                adapter.stop();
            }
        });
    });
}

function copyFiles(root, filesOrDirs, callback) {
    if (!filesOrDirs) {
        adapter.readDir('vis.0', root, (err, filesOrDirs) =>
            copyFiles(root, filesOrDirs || [], callback));
        return;
    }
    if (!filesOrDirs.length) {
        typeof callback === 'function' && callback();
        return;
    }

    const task = filesOrDirs.shift();
    if (task.isDir) {
        copyFiles(root + task.file + '/', null, () =>
            setImmediate(copyFiles, root, filesOrDirs, callback));
    } else {
        adapter.readFile('vis.0', root + task.file, (err, data) => {
            if (data || data === 0 || data === '') {
                adapter.writeFile(adapterName + '.0', root + task.file, data, () =>
                    setImmediate(copyFiles, root, filesOrDirs, callback));
            } else {
                setImmediate(copyFiles, root, filesOrDirs, callback);
            }
        });
    }
}

function generatePages(isLicenseError) {
    let count = 0;
    let changed = false;

    if (!isBeta) {
        changed = !!syncWidgetSets(false, isLicenseError);

        // upload config.js
        count++;
        adapter.readFile(adapterName, 'js/config.js', (err, data) => {
            const config = fs.existsSync(__dirname + '/www/js/config.js') ? fs.readFileSync(__dirname + '/www/js/config.js').toString('utf8') : '';
            data = data ? data.toString('utf8') : '';
            if (!data || data !== config) {
                changed = true;
                adapter.log.info('config.js changed. Upload.');
                adapter.writeFile(adapterName, 'js/config.js', config, () =>
                    !--count && checkFiles(changed, isBeta));
            } else {
                !--count && checkFiles(changed, isBeta);
            }
        });
    } else {
        count++;
        // try to read vis-beta.0/files
        adapter.readDir(adapterName + '.0', '/', (err, dirs) => {
            if (!dirs || !dirs.length) {
                // copy all directories
                copyFiles('/', null, () =>
                    !--count && checkFiles(changed, isBeta));
            } else {
                !--count && checkFiles(changed, isBeta);
            }
        });
    }

    // create command variable
    count++;
    adapter.getObject('control.command', (err, obj) => {
        if (!obj) {
            adapter.setObject('control.command',
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
                },
                () => !--count && checkFiles(changed, isBeta)
            );
        } else {
            !--count && checkFiles(changed, isBeta);
        }
    });

    // Create common user CSS file
    count++;
    adapter.readFile(adapterName, 'css/vis-common-user.css', (err, data) => {
        if (err || data === null || data === undefined) {
            adapter.writeFile(adapterName, 'css/vis-common-user.css', '', () =>
                !--count && checkFiles(changed, isBeta));
        } else {
            !--count && checkFiles(changed, isBeta);
        }
    });
}

function indicateError(callback) {
    let data = fs.readFileSync(__dirname + '/www/js/config.js').toString();
    if (data.indexOf('license: false,') === -1) {
        data = data.replace('const visConfig = {', 'const visConfig = {license: false,');
        fs.writeFileSync(__dirname + '/www/js/config.js', data);

        adapter.writeFile(adapterName, 'js/config.js', data, () =>
            updateCacheManifest(callback));
    } else {
        callback && callback();
    }
}

function check(uuidObj, originalError) {
    jwt.verify(adapter.config.license, fs.readFileSync(__dirname + '/lib/cloudCert.crt'), (err, decoded) => {
        if (err) {
            adapter.log.error('Cannot check license: ' + originalError);
            generatePages(true);
        } else {
            if (decoded && decoded.expires * 1000 < new Date().getTime()) {
                adapter.log.error('Cannot check license: Expired on ' + new Date(decoded.expires * 1000).toString());
                adapter.stop();
            } else if (!decoded) {
                adapter.log.error('Cannot check license: License is empty' + (originalError ? ' and ' + originalError : ''));
                generatePages(true);
            } else if (uuidObj.native.uuid.length !== 36) {
                if (decoded.invoice === 'free') {
                    adapter.log.error('Cannot use free license with commercial device!');
                    generatePages(true);
                } else {
                    generatePages(false);
                }
            } else {
                const code = [];
                for (let i = 0; i < decoded.type.length; i++) {
                    code.push('\\u00' + decoded.type.charCodeAt(i).toString(16));
                }

                if (code.join('') !== '\u0063\u006f\u006d\u006d\u0065\u0072\u0063\u0069\u0061\u006c') {
                    generatePages(false);
                } else {
                    originalError && adapter.log.error('Cannot check license: ' + originalError);
                    generatePages(true);
                }
            }
        }
    });
}

function main() {
    // first of all check license
    if (!adapter.config.license || typeof adapter.config.license !== 'string') {
        indicateError(() => {
            adapter.log.error('No license found for vis. Please get one on https://iobroker.net !');
            //adapter.stop();
            generatePages(true);
        });
    } else {
        adapter.getForeignObject('system.meta.uuid', (err, uuidObj) => {
            if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
                indicateError(() => {
                    adapter.log.error('UUID not found!');
                    generatePages(true);
                });
            } else {
                const data = JSON.stringify({json: adapter.config.license, uuid: uuidObj.native.uuid});

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

                    res.on('end', () => {
                        try {
                            const data = JSON.parse(result);
                            if (data.result === 'OK') {
                                if (uuidObj.native.uuid.length !== 36 && uuidObj.native.uuid.substring(0, 2) !== 'IO') {
                                    jwt.verify(adapter.config.license, fs.readFileSync(__dirname + '/lib/cloudCert.crt'), (err, decoded) => {
                                        if (err) {
                                            adapter.log.error('Cannot check license: ' + err);
                                            generatePages(true);
                                        } else {
                                            if (!decoded || decoded.invoice === 'free') {
                                                adapter.log.error('Cannot use free license with commercial device!');
                                                generatePages(true);
                                            } else {
                                                generatePages(false);
                                            }
                                        }
                                    });
                                } else {
                                    adapter.log.info('vis license is OK.');
                                    generatePages();
                                }
                            } else {
                                indicateError(() => {
                                    adapter.log.error(`License is invalid! Nothing updated. Error: ${data ? data.result : 'unknown'}`);
                                    generatePages(true);
                                });
                            }
                        } catch (e) {
                            check(uuidObj, e);
                        }
                    });

                    res.on('error', error => check(uuidObj, error));
                }).on('error', error => check(uuidObj, error));

                postReq.write(data);
                postReq.end();
            }
        });
    }
}
