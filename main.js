/**
 *
 *      iobroker vis Adapter
 *
 *      Copyright (c) 2014-2022, bluefox
 *      Copyright (c) 2014, hobbyquaker
 *
 *      CC-NC-BY 4.0 License
 *
 */
'use strict';

const adapterName    = require('./package.json').name.split('.').pop();
const utils          = require('@iobroker/adapter-core'); // Get common adapter utils
const fs             = require('fs');
const syncWidgetSets = require('./lib/install.js');
const https          = require('https');
const jwt            = require('jsonwebtoken');
let adapter;
let isLicenseError = false;
let lastProgressUpdate;

function startAdapter(options) {
    options = options || {};

    Object.assign(options, {
        name: adapterName,
        ready: () => main()
    });

    adapter = new utils.Adapter(options);
    return adapter;
}

async function generateWidgetsHtml(widgetSets) {
    let text = '';
    for (const w in widgetSets) {
        if (!widgetSets.hasOwnProperty(w)) {
            continue;
        }
        let file;
        let name;

        if (typeof widgetSets[w] === 'object') {
            name = widgetSets[w].name + '.html';
        } else {
            name = widgetSets[w] + '.html';
        }
        file = fs.readFileSync(__dirname + '/www/widgets/' + name);
        // extract all css and js

        text += '<!-- --------------' + name + '--- START -->\n' + file.toString() + '\n<!-- --------------' + name + '--- END -->\n';
    }

    let data;
    try {
        data = await adapter.readFileAsync(adapterName, 'widgets.html');
    } catch (err) {
        // ignore
    }
    if (typeof data === 'object') {
        data = data.file;
    }
    if (data && data !== text) {
        fs.writeFileSync(__dirname + '/www/widgets.html', text);
        // upload file to DB
        await adapter.writeFileAsync(adapterName, 'www/widgets.html', text);
        return true;
    } else if (!fs.existsSync(__dirname + '/www/widgets.html') || fs.readFileSync(__dirname + '/www/widgets.html').toString() !== text) {
        fs.writeFileSync(__dirname + '/www/widgets.html', text);
    }

    return false;
}

async function generateConfigPage() {
    let changed = false;

    const configJs = `window.isLicenseError = ${isLicenseError};`;

    // upload config.js
    let currentConfigJs = '';
    try {
        currentConfigJs = await adapter.readFileAsync(adapterName, 'config.js');
    } catch (err) {

    }
    if (typeof currentConfigJs === 'object') {
        currentConfigJs = currentConfigJs.file;
    }
    currentConfigJs = currentConfigJs ? currentConfigJs.toString('utf8') : '';
    if (!currentConfigJs || currentConfigJs !== configJs) {
        changed = true;
        adapter.log.info('config.js changed. Upload.');
        await adapter.writeFileAsync(adapterName, 'config.js', configJs);
        fs.writeFileSync(__dirname + '/www/config.js', configJs);
    } else if (!fs.existsSync(__dirname + '/www/config.js') || fs.readFileSync(__dirname + '/www/config.js').toString() !== configJs) {
        fs.writeFileSync(__dirname + '/www/config.js', configJs);
    }

    // Create common user CSS file
    let data;
    try {
        data = await adapter.readFileAsync(adapterName, 'css/vis-common-user.css');
        if (typeof data === 'object') {
            data = data.file;
        }
    } catch {
        data = null;
    }

    if (data === null || data === undefined) {
        await adapter.writeFileAsync(adapterName, 'css/vis-common-user.css', '');
    }

    return changed;
}

// delete this function as js.controller 4.0 will be mainstream
async function getSuitableLicenses(all) {
    if (adapter.getSuitableLicenses) {
        return adapter.getSuitableLicenses(all);
    } else {
        const licenses = [];
        try {
            const obj = await adapter.getForeignObjectAsync('system.licenses');
            const uuidObj = await adapter.getForeignObjectAsync('system.meta.uuid');

            let uuid;
            if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
                adapter.log.error('No UUID found!');
                return licenses;
            } else {
                uuid = uuidObj.native.uuid;
            }

            if (obj && obj.native && obj.native.licenses && obj.native.licenses.length) {
                const now = Date.now();
                const cert = fs.readFileSync(__dirname + '/lib/cloudCert.crt');
                const version = adapter.pack.version.split('.')[0];

                obj.native.licenses.forEach(license => {
                    try {
                        const decoded = jwt.verify(license.json, cert);
                        if (
                            decoded.name &&
                            (!decoded.valid_till ||
                                decoded.valid_till === '0000-00-00 00:00:00' ||
                                new Date(decoded.valid_till).getTime() > now)
                        ) {
                            if (
                                decoded.name.startsWith('iobroker.' + this.name) &&
                                (all || !license.usedBy || license.usedBy === this.namespace)
                            ) {
                                // Licenses for version ranges 0.x and 1.x are handled identically and are valid for both version ranges.
                                //
                                // If license is for adapter with version 0 or 1
                                if (
                                    decoded.version === '&lt;2' ||
                                    decoded.version === '<2' ||
                                    decoded.version === '<1' ||
                                    decoded.version === '<=1'
                                ) {
                                    // check the current adapter major version
                                    if (version !== 0 && version !== 1) {
                                        return;
                                    }
                                } else if (decoded.version && decoded.version !== version) {
                                    // Licenses for adapter versions >=2 need to match to the adapter major version
                                    // which means that a new major version requires new licenses if it would be "included"
                                    // in last purchase

                                    // decoded.version could be only '<2' or direct version, like "2", "3" and so on
                                    return;
                                }

                                if (decoded.uuid && decoded.uuid !== uuid) {
                                    // License is not for this server
                                    return;
                                }

                                // remove free license if commercial license found
                                if (decoded.invoice !== 'free') {
                                    const pos = licenses.findIndex(item => item.invoice === 'free');
                                    if (pos !== -1) {
                                        licenses.splice(pos, 1);
                                    }
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

        licenses.sort((a, b) => {
            const aInvoice = a.decoded.invoice !== 'free';
            const bInvoice = b.decoded.invoice !== 'free';
            if (aInvoice === bInvoice) {
                return 0;
            } else if (aInvoice) {
                return -1;
            } else if (bInvoice) {
                return 1;
            }
        });

        return licenses;
    }
}

function checkLicense(license, uuid, originalError) {
    if (license && license.expires * 1000 < new Date().getTime()) {
        adapter.log.error(`Cannot check license: Expired on ${new Date(license.expires * 1000).toString()}`);
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

        if (license.uuid && uuid !== license.uuid) {
            adapter.log.error(`License is for other device with UUID "${license.uuid}". This device has UUID "${uuid}"`);
            return true;
        }

        const t = '\u0063\u006f\u006d\u006d\u0065\u0072\u0063\u0069\u0061\u006c';
        if (t.length !== code.length) {
            originalError && adapter.log.error('Cannot check license: ' + originalError);
            return true;
        }
        for (let s = 0; s < code.length; s++) {
            if (code[s] !== '\\u00' + t.charCodeAt(s).toString(16)) {
                originalError && adapter.log.error('Cannot check license: ' + originalError);
                return true;
            }
        }

        return false;
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
                            resolve(false);
                        }
                    } else {
                        isLicenseError = true
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

async function readAdaptersList() {
    const res = await adapter.getObjectViewAsync('system', 'instance', {});
    return res.rows.filter(item => item.value.common.enabled)
        .map(item => item.value._id.replace('system.adapter.', '').replace(/\.\d+$/, '')).sort();
}

/**
 * Collect Files of an adapter specific directory from the iobroker storage
 *
 * @param path path in the adapter specific storage space
 */
async function collectExistingFilesToDelete(path) {
    let _files = [];
    let _dirs = [];
    let files;
    try {
        adapter.log.debug('Scanning ' + path);
        files = await adapter.readDirAsync('vis', path);
    } catch {
        // ignore err
        files = [];
    }

    if (files && files.length) {
        for (const file of files) {
            if (file.file === '.' || file.file === '..') {
                continue;
            }
            const newPath = path + file.file;
            if (file.isDir) {
                if (!_dirs.find(e => e.path === newPath)) {
                    _dirs.push({ adapter, path: newPath });
                }
                try {
                    const result = await collectExistingFilesToDelete(`${newPath}/`);
                    if (result.filesToDelete) {
                        _files = _files.concat(result.filesToDelete);
                    }

                    _dirs = _dirs.concat(result.dirs);
                } catch (err) {
                    adapter.log.warn(`Cannot delete folder "${adapter}${newPath}/": ${err.message}`);
                }
            } else if (!_files.find(e => e.path === newPath)) {
                _files.push(newPath);
            }
        }
    }

    return { filesToDelete: _files, dirs: _dirs };
}

async function eraseFiles(files) {
    if (files && files.length) {
        for (const file of files) {
            try {
                // @ts-expect-error should be fixed with #1917
                await adapter.unlinkAsync('vis', file);
            } catch (err) {
                adapter.log.error(`Cannot delete file "${file}": ${err}`);
            }
        }
    }
}

async function upload(files) {
    const uploadID = `system.adapter.vis.upload`;

    await adapter.setForeignStateAsync(uploadID, { val: 0, ack: true });

    for (let f = 0; f < files.length; f++) {
        const file = files[f];

        let attName = file.substring((__dirname + '/www/').length).replace(/\\/g, '/');
        if (files.length - f > 100) {
            (!f || !((files.length - f - 1) % 50)) &&
            adapter.log.debug(`upload [${files.length - f - 1}] ${file.substring((__dirname + '/www/').length)} ${attName}`);
        } else if (files.length - f - 1 > 20) {
            (!f || !((files.length - f - 1) % 10)) &&
            adapter.log.debug(`upload [${files.length - f - 1}] ${file.substring((__dirname + '/www/').length)} ${attName}`);
        } else {
            adapter.log.debug(`upload [${files.length - f - 1}] ${file.substring((__dirname + '/www/').length)} ${attName}`);
        }

        // Update upload indicator
        const now = Date.now();
        if (!lastProgressUpdate || now - lastProgressUpdate > 1000) {
            lastProgressUpdate = now;
            await adapter.setForeignStateAsync(uploadID, {
                val: Math.round((1000 * (files.length - f)) / files.length) / 10,
                ack: true
            });
        }

        try {
            const data = fs.readFileSync(file);
            await adapter.writeFileAsync('vis', attName, data);
        } catch (e) {
            adapter.log.error(`Error: Cannot upload ${file}: ${e.message}`);
        }
    }

    // Set upload progress to 0;
    if (files.length) {
        await adapter.setForeignStateAsync(uploadID, { val: 0, ack: true });
    }

    return adapter;
}

// Read synchronous all files recursively from local directory
function walk(dir, _results) {
    const results = _results || [];
    try {
        if (fs.existsSync(dir)) {
            const list = fs.readdirSync(dir);
            list.map(file => {
                const stat = fs.statSync(`${dir}/${file}`);
                if (stat.isDirectory()) {
                    walk(`${dir}/${file}`, results);
                } else {
                    if (!file.endsWith('.npmignore') &&
                        !file.endsWith('.gitignore') &&
                        !file.endsWith('.DS_Store') &&
                        !file.endsWith('_socket/info.js')
                    ) {
                        results.push(`${dir}/${file}`);
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
    }

    return results;
}

/**
 * Upload given adapter
 */
async function uploadAdapter() {
    let dir = __dirname + '/www';

    if (!fs.existsSync(dir)) {
        return;
    }

    // Create "upload progress" object if not exists
    let obj;
    try {
        obj = await adapter.getForeignObjectAsync(`system.adapter.vis.upload`);
    } catch {
        // ignore
    }
    if (!obj) {
        await adapter.setForeignObjectAsync(`system.adapter.vis.upload`, {
            type: 'state',
            common: {
                name: `vis.upload`,
                type: 'number',
                role: 'indicator.state',
                unit: '%',
                min: 0,
                max: 100,
                def: 0,
                desc: 'Upload process indicator',
                read: true,
                write: false
            },
            native: {}
        });
    }

    await adapter.setForeignStateAsync(`system.adapter.vis.upload`, 0, true);

    let result;
    try {
        result = await adapter.getForeignObjectAsync('vis');
    } catch {
        // ignore
    }
    // Read all names with subtrees from local directory
    const files = walk(dir);
    if (!result) {
        await adapter.setForeignObjectAsync('vis', {
            type: 'meta',
            common: {
                name: 'vis',
                type: 'www'
            },
            native: {}
        });
    }

    const { filesToDelete } = await collectExistingFilesToDelete('/');
    adapter.log.debug('Erasing files: ' + filesToDelete.length);
    // delete old files, before upload of new
    await eraseFiles(filesToDelete);

    await upload(files);

    return adapter;
}

async function main() {
    const visObj = await adapter.getForeignObjectAsync(adapterName);
    if (!visObj || visObj.type !== 'meta') {
        await adapter.setForeignObjectAsync(adapterName, {
            type: 'meta',
            common: {
                name: 'user files and images for vis',
                type: 'meta.user'
            },
            native: {}
        });
    }

    // first check license
    if (!adapter.config.useLicenseManager && (!adapter.config.license || typeof adapter.config.license !== 'string')) {
        isLicenseError = true
        adapter.log.error('No license found for vis. Please get one on https://iobroker.net !');
    } else {
        const uuidObj = await adapter.getForeignObjectAsync('system.meta.uuid');
        if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
            isLicenseError = true
            adapter.log.error('UUID not found!');
        } else {
            let license = adapter.config.license;
            if (adapter.config.useLicenseManager) {
                license = await getSuitableLicenses();
                license = license[0] && license[0].json;
            }

            if (!license) {
                adapter.log.error('No license found for vis. Please get one on https://iobroker.net !');
                isLicenseError = true;
            } else {
                try {
                    isLicenseError = await doLicense(license, uuidObj.native.uuid);
                } catch (err) {
                    isLicenseError = check(license, uuidObj.native.uuid, err);
                }
            }
        }
    }

    const configChanged = await generateConfigPage();
    const enabledList = await readAdaptersList();

    const widgetSets = syncWidgetSets(false, enabledList);
    const widgetsChanged = await generateWidgetsHtml(widgetSets);

    const indexHtml = fs.readFileSync(__dirname + '/www/index.html').toString('utf8');
    let uploadedIndexHtml;
    try {
        uploadedIndexHtml = await adapter.readFileAsync(adapterName, 'index.html');
    } catch (err) {
        // ignore
    }
    if (typeof uploadedIndexHtml === 'object') {
        uploadedIndexHtml = uploadedIndexHtml.file;
    }
    uploadedIndexHtml = uploadedIndexHtml ? uploadedIndexHtml.toString('utf8') : uploadedIndexHtml;

    if (configChanged || widgetsChanged || uploadedIndexHtml !== indexHtml) {
        await uploadAdapter();
    }
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
