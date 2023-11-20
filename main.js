/**
 *
 *      iobroker vis-2 Adapter
 *
 *      Copyright (c) 2021-2023, bluefox
 *
 *      CC-NC-BY 4.0 License
 *
 */
const adapterName    = require('./package.json').name.split('.').pop();
const utils          = require('@iobroker/adapter-core'); // Get common adapter utils
const fs             = require('fs');
const syncWidgetSets = require('./lib/install.js');
const https          = require('https');
const jwt            = require('jsonwebtoken');
const path           = require('path');
const cert           = fs.readFileSync(`${__dirname}/lib/cloudCert.crt`);

let adapter;
let isLicenseError   = false;
let lastProgressUpdate;
let widgetInstances  = {};
let stoppingPromise = false;
let synchronyzing = false;

function startAdapter(options) {
    options = options || {};

    Object.assign(options, {
        name: adapterName,
        ready: main,
        objectChange: async (id, obj) => {
            // if it is an instance object
            if (id.startsWith('system.adapter.') &&
                id.match(/\d+$/) &&
                id !== 'system.adapter.vis-2-beta.0' &&
                id !== 'system.adapter.vis.0'
            ) {
                if (obj && obj.type !== 'instance') {
                    return;
                }
                id = id.substring('system.adapter.'.length).replace(/\.\d+$/, '');
                if (!obj || !obj.common || !obj.common.version) {
                    if (widgetInstances[id]) {
                        delete widgetInstances[id];
                        await buildHtmlPages();
                    }
                } else
                // Check if the widgets folder exists
                if (POSSIBLE_WIDGET_SETS_LOCATIONS.find(dir => fs.existsSync(`${dir}/iobroker.${id}/widgets/`))) {
                    // still exists
                    if (!widgetInstances[id] || widgetInstances[id] !== obj.common.version) {
                        widgetInstances[id] = obj.common.version;
                        await buildHtmlPages();
                    }
                } else if (widgetInstances[id]) {
                    delete widgetInstances[id];
                    await buildHtmlPages();
                }
            }
        },
        message: obj => processMessage(obj),
        unload: callback => {
            if (synchronyzing) {
                new Promise(resolve => stoppingPromise = resolve)
                    .then(() => callback && callback())
            } else {
                callback && callback();
            }
        }
    });

    adapter = new utils.Adapter(options);
    return adapter;
}

async function processMessage(msg) {
    if (msg && msg.command === 'checkLicense' && msg.message && msg.callback) {
        const obj = await adapter.getForeignObjectAsync(`system.adapter.${msg.message}.0`);
        if (!obj || !obj.native || (!obj.native.license && !obj.native.useLicenseManager)) {
            console.log(`[${msg.message}] License not found`);
            adapter.sendTo(msg.from, msg.command, {error: 'License not found'}, msg.callback);
        } else {
            const result = await checkL(obj.native.license, obj.native.useLicenseManager, msg.message);
            adapter.sendTo(msg.from, msg.command, {result}, msg.callback);
        }
    }
}

async function generateWidgetsHtml(widgetSets, forceBuild) {
    let text = '';
    for (const w in widgetSets) {
        if (!widgetSets.hasOwnProperty(w)) {
            continue;
        }
        let file;
        let name;

        if (typeof widgetSets[w] === 'object') {
            name = `${widgetSets[w].name}.html`;
        } else {
            name = `${widgetSets[w]}.html`;
        }
        try {
            file = fs.readFileSync(`${__dirname}/www/widgets/${name}`);
            // extract all css and js

            // mark all scripts with data-widgetset attribute
            file = file.toString().replace(/<script/g, `<script data-widgetset="${name.replace('.html', '')}"`);

            text += `<!-- --------------${name}--- START -->\n${file.toString()}\n<!-- --------------${name}--- END -->\n`;
        } catch (e) {
            adapter.log.warn(`Cannot read file www/widgets/${name}`);
        }
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
    if (data && (data !== text || forceBuild)) {
        try {
            fs.writeFileSync(`${__dirname}/www/widgets.html`, text);
            // upload file to DB
            await adapter.writeFileAsync(adapterName, 'www/widgets.html', text);
        } catch (e) {
            adapter.log.error(`Cannot write file www/widgets.html: ${e}`);
        }
        return true;
    } else if (!fs.existsSync(`${__dirname}/www/widgets.html`) || fs.readFileSync(`${__dirname}/www/widgets.html`).toString() !== text) {
        try {
            fs.writeFileSync(`${__dirname}/www/widgets.html`, text);
        } catch (e) {
            adapter.log.error(`Cannot write file www/widgets.html: ${e}`);
        }
    }

    return false;
}

async function generateConfigPage(forceBuild, enabledList) {
    let changed = forceBuild || false;

    // for back compatibility with vis.1 on cloud
    const widgetSets = [
        'basic',
        'jqplot',
        'jqui',
        'swipe',
        'tabs',
    ];

    // collect vis-1 widgets
    enabledList.forEach(obj => {
        if (!obj.pack.common.visWidgets) {
            // find folder in widgets
            let path = `${__dirname}/../node_modules/${obj.name}/widgets`;
            if (!fs.existsSync(path)) {
                path = `${__dirname}/../${obj.name}/widgets`;
                if (!fs.existsSync(path)) {
                    path = null;
                }
            }
            if (path) {
                fs.readdirSync(path).forEach(file => {
                    if (file.match(/\.html$/)) {
                        const folderName = file.replace('.html', '');
                        !widgetSets.includes(folderName) && widgetSets.push(folderName);
                    }
                });
            }
        }
    });

    const configJs =
`window.isLicenseError = ${isLicenseError};
// for back compatibility with vis.1 on cloud
window.visConfig = {
    "widgetSets": ${JSON.stringify(widgetSets)}
};
if (typeof exports !== 'undefined') {
    exports.config = visConfig;
} else {
    window.visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
`;

    // upload config.js
    let currentConfigJs = '';
    try {
        currentConfigJs = await adapter.readFileAsync(adapterName, 'config.js');
    } catch (err) {
        // ignore
    }
    if (typeof currentConfigJs === 'object') {
        currentConfigJs = currentConfigJs.file;
    }
    currentConfigJs = currentConfigJs ? currentConfigJs.toString('utf8') : '';
    if (!currentConfigJs || currentConfigJs !== configJs || forceBuild) {
        changed = true;
        adapter.log.info('config.js changed. Upload.');
        await adapter.writeFileAsync(adapterName, 'config.js', configJs);
        try {
            fs.writeFileSync(`${__dirname}/www/config.js`, configJs);
            !fs.existsSync(`${__dirname}/www/js`) && fs.mkdirSync(`${__dirname}/www/js`);
            fs.writeFileSync(`${__dirname}/www/js/config.js`, configJs); // backwards compatibility with cloud
        } catch (e) {
            adapter.log.error(`Cannot write file www/config.js: ${e}`);
        }
    } else if (!fs.existsSync(`${__dirname}/www/config.js`) || fs.readFileSync(`${__dirname}/www/config.js`).toString() !== configJs) {
        try {
            fs.writeFileSync(`${__dirname}/www/config.js`, configJs);
            !fs.existsSync(`${__dirname}/www/js`) && fs.mkdirSync(`${__dirname}/www/js`);
            fs.writeFileSync(`${__dirname}/www/js/config.js`, configJs); // backwards compatibility with cloud
        } catch (e) {
            adapter.log.error(`Cannot write file www/config.js: ${e}`);
        }
    }
    if (!fs.existsSync(`${__dirname}/www/js/config.js`) || fs.readFileSync(`${__dirname}/www/js/config.js`).toString() !== configJs) {
        try {
            !fs.existsSync(`${__dirname}/www/js`) && fs.mkdirSync(`${__dirname}/www/js`);
            fs.writeFileSync(`${__dirname}/www/js/config.js`, configJs); // backwards compatibility with cloud
        } catch (e) {
            adapter.log.error(`Cannot write file www/config.js: ${e}`);
        }
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
async function getSuitableLicenses(all, name) {
    if (adapter.getSuitableLicenses) {
        return adapter.getSuitableLicenses(all, name);
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
                                decoded.name.startsWith(`iobroker.${name || adapterName}`) &&
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
                                    if (version !== '0' && version !== '1') {
                                        return;
                                    }
                                } else if (decoded.version && decoded.version !== version) {
                                    // Licenses for adapter versions >=2 need to match to the adapter major version,
                                    // which means that a new major version requires new licenses if it would be "included"
                                    // in the last purchase

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

function checkLicense(license, uuid, originalError, name) {
    const version = adapter.pack.version.split('.')[0];

    if (license && license.expires * 1000 < new Date().getTime()) {
        adapter.log.error(`License error: Expired on ${new Date(license.expires * 1000).toString()}`);
        return true;
    } else if (!license) {
        adapter.log.error(`License error: License is empty${originalError ? ` and ${originalError}` : ''}`);
        return true;
    } else if (uuid.length !== 36 && license.invoice === 'free' && !uuid.startsWith('IO')) {
        adapter.log.error('Cannot use free license with commercial device!');
        return true;
    } else if (license.name !== name && license.name !== `iobroker.${name}`) {
        adapter.log.error(`License is for other adapter "${license.name}". Expected "iobroker.${name}"`);
        return true;
    } else if (
        (version !== '1' && version !== license.version) ||
        (version === '1' && license.version !== '&lt;2' && license.version !== '<2' && license.version !== '<1' && license.version !== '<=1')
    ) {
        adapter.log.error(`License is for other adapter version "${license.name}@${license.version}". Expected "iobroker.${name}@${version}"`);
        return true;
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
            originalError && adapter.log.error(`Cannot check license: ${originalError}`);
            return true;
        }
        for (let s = 0; s < code.length; s++) {
            if (code[s] !== '\\u00' + t.charCodeAt(s).toString(16)) {
                originalError && adapter.log.error(`Cannot check license: ${originalError}`);
                return true;
            }
        }

        return false;
    }
}

function check(license, uuid, originalError, name) {
    try {
        const decoded = jwt.verify(license, fs.readFileSync(`${__dirname}/lib/cloudCert.crt`));
        return checkLicense(decoded, uuid, originalError, name);
    } catch (err) {
        adapter.log.error(`Cannot check license: ${originalError}`);
        return true
    }
}

function doLicense(license, uuid, name) {
    const version = adapter.pack.version.split('.')[0];

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            json: license,
            uuid,
            version,
        });

        // An object of options to indicate where to post to
        const postOptions = {
            host: 'iobroker.net',
            path: '/api/v1/public/cert/',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(data),
            },
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
                        if (data.name !== `iobroker.${name}` &&
                            data.name !== name &&
                            data.name !== `iobroker.${name}.offline` &&
                            data.name !== `iobroker.${name}.offline.action`
                        ) {
                            adapter.log.error(`License is for other adapter "${data.name}". Expected "iobroker.${name}"`);
                            resolve(true);
                        } else
                        if (uuid.length !== 36 && uuid.substring(0, 2) !== 'IO') {
                            try {
                                const decoded = jwt.verify(license, fs.readFileSync(`${__dirname}/lib/cloudCert.crt`));
                                if (!decoded || decoded.invoice === 'free') {
                                    adapter.log.error('Cannot use free license with commercial device!');
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            } catch (err) {
                                adapter.log.error(`Cannot check license: ${err}`);
                                resolve(true);
                            }
                        } else {
                            adapter.log.info('vis-2 license is OK.');
                            resolve(false);
                        }
                    } else {
                        adapter.log.error(`License is invalid! Nothing updated. Error: ${data ? (data.error || data.result) : 'unknown'}`);
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

function collectWidgetSets(dir, sets) {
    sets = sets || [];
    if (!fs.existsSync(dir)) {
        return sets;
    }
    let dirs = fs.readdirSync(dir);
    dir = dir.replace(/\\/g, '/');
    if (!dir.endsWith('/')) {
        dir += '/';
    }
    for (let d = 0; d < dirs.length; d++) {
        if (dirs[d].toLowerCase().startsWith('iobroker.') &&
            !sets.includes(dirs[d].substring('iobroker.'.length)) &&
            fs.existsSync(`${dir}${dirs[d]}/widgets/`)
        ) {
            let pack;
            try {
                pack = JSON.parse(fs.readFileSync(`${dir}${dirs[d]}/io-package.json`).toString());
            } catch (e) {
                pack = null;
                console.warn(`Cannot parse "${dir}${dirs[d]}/io-package.json": ${e}`);
            }
            sets.push({path: dir + dirs[d], name: dirs[d].toLowerCase(), pack});
        }
    }

    return sets;
}

const POSSIBLE_WIDGET_SETS_LOCATIONS = [
    path.normalize(`${__dirname}/../`),
    path.normalize(`${__dirname}/node_modules/`),
    path.normalize(`${__dirname}/../../`),
];

async function readAdapterList() {
    const res = await adapter.getObjectViewAsync('system', 'instance', {});

    const instances = [];
    res.rows
        .forEach(item => {
            const obj = item.value;
            // ignore widgets for V1 only
            if (obj?.common?.visWidgets?.ignoreInVersions?.includes(2)) {
                return;
            }
            const name = obj && obj._id && obj._id.replace('system.adapter.', '').replace(/\.\d+$/, '');
            if (name && !instances.includes(name)) {
                instances.push(name);
            }
        });

    instances.sort();

    let sets = [];
    POSSIBLE_WIDGET_SETS_LOCATIONS.forEach(dir => collectWidgetSets(dir, sets));
    sets = sets.filter(s => instances.includes(s.name.substring('iobroker.'.length)));

    return sets;
}

/**
 * Collect Files of an adapter-specific directory from the iobroker storage
 *
 * @param path path in the adapter-specific storage space
 */
async function collectExistingFilesToDelete(path) {
    let _files = [];
    let _dirs = [];
    let files;

    if (stoppingPromise) {
        return { filesToDelete: _files, dirs: _dirs };
    }

    try {
        adapter.log.debug(`Scanning ${path}`);
        files = await adapter.readDirAsync(adapterName, path);
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
            if (file === '/index.html' || file === '/edit.html') {
                continue;
            }
            if (stoppingPromise) {
                return;
            }
            try {
                // @ts-expect-error should be fixed with #1917
                await adapter.unlinkAsync(adapterName, file);
            } catch (err) {
                adapter.log.error(`Cannot delete file "${file}": ${err}`);
            }
        }
    }
}

async function upload(files) {
    const uploadID = `system.adapter.${adapterName}.upload`;

    await adapter.setForeignStateAsync(uploadID, { val: 0, ack: true });

    const wwwLen = (`${__dirname}/www/`).length;

    for (let f = 0; f < files.length; f++) {
        const file = files[f];

        if (stoppingPromise) {
            return;
        }

        let attName = file.substring(wwwLen).replace(/\\/g, '/');
        if (attName === 'index.html' || attName === 'edit.html') {
            continue;
        }
        // write upload status into log
        if (files.length - f > 100) {
            (!f || !((files.length - f - 1) % 50)) &&
            adapter.log.debug(`upload [${files.length - f - 1}] ${file.substring(wwwLen)} ${attName}`);
        } else if (files.length - f - 1 > 20) {
            (!f || !((files.length - f - 1) % 10)) &&
            adapter.log.debug(`upload [${files.length - f - 1}] ${file.substring(wwwLen)} ${attName}`);
        } else {
            adapter.log.debug(`upload [${files.length - f - 1}] ${file.substring(wwwLen)} ${attName}`);
        }

        // Update upload indicator
        const now = Date.now();
        if (!lastProgressUpdate || now - lastProgressUpdate > 1000) {
            lastProgressUpdate = now;
            await adapter.setForeignStateAsync(uploadID, {
                val: Math.round((1000 * (files.length - f)) / files.length) / 10,
                ack: true,
            });
        }

        try {
            const data = fs.readFileSync(file);
            await adapter.writeFileAsync(adapterName, attName, data);
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

    if (stoppingPromise) {
        return results;
    }

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
    let dir = `${__dirname}/www`;

    if (!fs.existsSync(dir)) {
        return;
    }

    // Create "upload progress" object if not exists
    let obj;
    try {
        obj = await adapter.getForeignObjectAsync(`system.adapter.${adapterName}.upload`);
    } catch {
        // ignore
    }
    if (!obj) {
        await adapter.setForeignObjectAsync(`system.adapter.${adapterName}.upload`, {
            type: 'state',
            common: {
                name: `${adapterName}.upload`,
                type: 'number',
                role: 'indicator.state',
                unit: '%',
                min: 0,
                max: 100,
                def: 0,
                desc: 'Upload process indicator',
                read: true,
                write: false,
            },
            native: {},
        });
    }

    await adapter.setForeignStateAsync(`system.adapter.${adapterName}.upload`, 0, true);

    let result;
    try {
        result = await adapter.getForeignObjectAsync(adapterName);
    } catch {
        // ignore
    }
    // Read all names with subtrees from the local directory
    const files = walk(dir);
    if (!result) {
        await adapter.setForeignObjectAsync(adapterName, {
            type: 'meta',
            common: {
                name: adapterName,
                type: 'www',
            },
            native: {},
        });
    }

    const { filesToDelete } = await collectExistingFilesToDelete('/');
    adapter.log.debug(`Erasing files: ${filesToDelete.length}`);

    if (stoppingPromise) {
        return;
    }

    // write temp index.html and edit.html
    await adapter.writeFileAsync(adapterName, 'index.html', fs.readFileSync(`${__dirname}/lib/updating.html`).toString('utf8'));
    await adapter.writeFileAsync(adapterName, 'edit.html', fs.readFileSync(`${__dirname}/lib/updating.html`).toString('utf8'));

    // delete old files, before upload of new
    await eraseFiles(filesToDelete);
    await upload(files);

    if (stoppingPromise) {
        return;
    }

    // restore normal files
    await adapter.writeFileAsync(adapterName, 'edit.html', fs.readFileSync(`${__dirname}/www/edit.html`).toString('utf8'));
    await adapter.writeFileAsync(adapterName, 'index.html', fs.readFileSync(`${__dirname}/www/index.html`).toString('utf8'));
}

async function copyFolder(sourceId, sourcePath, targetId, targetPath) {
    let files;
    try {
        files = await adapter.readDirAsync(sourceId, sourcePath);
    } catch (e) {
        return;
    }

    for (let f = 0; f < files.length; f++) {
        if (files[f].isDir) {
            await copyFolder(sourceId, `${sourcePath}/${files[f].file}`, targetId, `${targetPath}/${files[f].file}`);
        } else {
            const data = await adapter.readFileAsync(sourceId, `${sourcePath}/${files[f].file}`);
            await adapter.writeFileAsync(targetId, `${targetPath}/${files[f].file}`, data.file);
        }
    }
}

async function buildHtmlPages(forceBuild) {
    synchronyzing = true;
    const enabledList = await readAdapterList();
    const configChanged = await generateConfigPage(forceBuild, enabledList);

    widgetInstances = {};
    enabledList.forEach(adapter =>
        widgetInstances[adapter.name.substring('iobroker.'.length)] = adapter.pack && adapter.pack.common && adapter.pack.common.version);

    const {widgetSets, filesChanged} = syncWidgetSets(enabledList, forceBuild);
    const widgetsChanged = await generateWidgetsHtml(widgetSets, forceBuild);

    let uploadedIndexHtml = '';
    let indexHtml = '';
    if (fs.existsSync(`${__dirname}/www/index.html`)) {
        indexHtml = fs.readFileSync(`${__dirname}/www/index.html`).toString('utf8');
        try {
            uploadedIndexHtml = await adapter.readFileAsync(adapterName, 'index.html');
        } catch (err) {
            // ignore
        }
        if (typeof uploadedIndexHtml === 'object') {
            uploadedIndexHtml = uploadedIndexHtml.file;
        }
        uploadedIndexHtml = uploadedIndexHtml ? uploadedIndexHtml.toString('utf8') : uploadedIndexHtml;
    }

    if (configChanged || widgetsChanged || filesChanged || uploadedIndexHtml !== indexHtml || forceBuild) {
        try {
            await uploadAdapter();
        } catch (e) {
            adapter.log.error(`Could not upload adapter: ${e.message}`)
        }

        // terminate promise
        if (stoppingPromise) {
            if (typeof stoppingPromise === 'function') {
                stoppingPromise();
                stoppingPromise = null;
            }
            synchronyzing = false;
            return;
        }

        await adapter.setStateAsync('info.uploaded', Date.now(), true);
    } else {
        const state = await adapter.getStateAsync('info.uploaded');
        if (!state || !state.val) {
            adapter.setStateAsync('info.uploaded', Date.now(), true);
        }
    }
    synchronyzing = false;
    if (typeof stoppingPromise === 'function') {
        stoppingPromise();
        stoppingPromise = null;
    }
}

async function checkL(license, useLicenseManager, name) {
    if (name === 'vis-2') {
        name = 'vis';
    }
    const uuidObj = await adapter.getForeignObjectAsync('system.meta.uuid');
    if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
        adapter.log.error('UUID not found!');
        return false;
    } else {
        if (useLicenseManager) {
            license = await getSuitableLicenses(true, name);
            license = license[0] && license[0].json;
        }

        if (!license) {
            adapter.log.error('No license found for vis, vis-2. Please get one on https://iobroker.net !');
            return false;
        } else {
            try {
                return !await doLicense(license, uuidObj.native.uuid, name);
            } catch (err) {
                return check(license, uuidObj.native.uuid, err, name);
            }
        }
    }
}

async function exportFormOlderVersions() {
    // Check if first start of vis-2
    let files;
    try {
        files = await adapter.readDirAsync('vis-2.0', '');
    } catch (e) {

    }

    // if no files found, try to copy from vis-2-beta.0
    if (!files || !files.length) {
        // if vis-2-beta installed, copy files from vis-2-beta to vis-2
        try {
            files = await adapter.readDirAsync('vis-2-beta.0', '');
        } catch (e) {

        }

        if (files && files.length) {
            // copy recursive all
            await copyFolder('vis-2-beta.0', '', 'vis-2.0', '');
        } else {
            // try to copy from vis.0
            try {
                files = await adapter.readDirAsync('vis.0', '');
            } catch (e) {

            }
            if (files && files.length) {
                // copy recursive all
                await copyFolder('vis.0', '', 'vis-2.0', '');
            }
        }
    }
}

async function main() {
    const visObj = await adapter.getForeignObjectAsync(adapterName);

    if (!fs.existsSync(`${__dirname}/www`)) {
        adapter.log.error('Cannot find www folder. Looks like adapter was installed from github! Please install it from npm!');
        return;
    }

    // create a vis "meta" object if not exists
    if (!visObj || visObj.type !== 'meta') {
        await adapter.setForeignObjectAsync(adapterName, {
            type: 'meta',
            common: {
                name: 'vis-2 core files',
                type: 'meta.user',
            },
            native: {},
        });
    }

    // create a vis-2.0 "meta" object, if not exists
    const visObjNS = await adapter.getForeignObjectAsync(adapter.namespace);
    if (!visObjNS || visObjNS.type !== 'meta') {
        await adapter.setForeignObjectAsync(adapter.namespace, {
            type: 'meta',
            common: {
                name: 'user files and images for vis-2',
                type: 'meta.user',
            },
            native: {},
        });
    }

    // repair chart view
    const systemView = await adapter.getForeignObjectAsync('_design/system');
    if (systemView && systemView.views && !systemView.views.chart) {
        systemView.views.chart = {
            map: 'function(doc) { if (doc.type === \'chart\') emit(doc._id, doc) }'
        };
        await adapter.setForeignObjectAsync(systemView._id, systemView);
    }

    // Change running mode to daemon
    const instanceObj = await adapter.getForeignObjectAsync(`system.adapter.${adapter.namespace}`);
    if (instanceObj && instanceObj.common && (instanceObj.common.mode !== 'daemon' || !instanceObj.common.messagebox)) {
        instanceObj.common.mode = 'daemon';
        instanceObj.common.messagebox = true;

        await adapter.setForeignObjectAsync(instanceObj._id, instanceObj);
        // controller will do restart
        return;
    }

    // first check license
    if (!adapter.config.useLicenseManager && (!adapter.config.license || typeof adapter.config.license !== 'string')) {
        isLicenseError = true
        adapter.log.error('No license found for vis-2. Please get one on https://iobroker.net !');
    } else {
        isLicenseError = !(await checkL(adapter.config.license, adapter.config.useLicenseManager, 'vis' || adapterName));
    }

    await exportFormOlderVersions();

    await buildHtmlPages(adapter.config.forceBuild);

    if (adapter.config.forceBuild) {
        adapter.log.warn('Force build done! Restarting...');
        await adapter.extendForeignObjectAsync(`system.adapter.${adapter.namespace}`, { native: { forceBuild: false } });
    } else {
        adapter.subscribeForeignObjects('system.adapter.*');
    }
}

// If started as allInOne mode => return function to create instance
// @ts-ignore
if (module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
