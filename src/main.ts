/**
 *
 *      iobroker vis Adapter (version 1). ioBroker.vis-2 is another adapter and has another license.
 *
 *      Copyright (c) 2014-2026, bluefox
 *      Copyright (c) 2014, hobbyquaker
 *
 *      MIT License
 *
 */
import * as utils from '@iobroker/adapter-core';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { syncWidgetSets, type VisConfig } from './lib/install';

// this file is compiled to build/main.js, the adapter files (www, package.json) are one level higher
const adapterDir = join(__dirname, '..');
const adapterName: string = JSON.parse(readFileSync(`${adapterDir}/package.json`, 'utf8'))
    .name.split('.')
    .pop();

let adapter: ioBroker.Adapter;

function startAdapter(options?: Partial<utils.AdapterOptions>): ioBroker.Adapter {
    options = options || {};

    Object.assign(options, {
        name: adapterName,
        ready: () => main(),
    });

    adapter = new utils.Adapter(options as utils.AdapterOptions);

    return adapter;
}

/** Reads a file of the adapter from the ioBroker DB, returns undefined if it does not exist */
async function readAdapterFile(fileName: string): Promise<string | Buffer | undefined> {
    try {
        const data = await adapter.readFileAsync(adapterName, fileName);
        return data?.file;
    } catch {
        return undefined;
    }
}

async function writeFile(fileName: string): Promise<boolean> {
    const config: VisConfig = require(`${adapterDir}/www/js/config.js`).config;
    let index: string;
    const srcFileNameParts = fileName.split('.');
    const ext = srcFileNameParts.pop();
    const srcFileName = `${srcFileNameParts.join('.')}.src.${ext}`;
    if (existsSync(`${adapterDir}/www/${srcFileName}`)) {
        index = readFileSync(`${adapterDir}/www/${srcFileName}`).toString();
    } else {
        index = readFileSync(`${adapterDir}/www/${fileName}`).toString();
        writeFileSync(`${adapterDir}/www/${srcFileName}`, index);
    }

    // enable cache
    index = index.replace(
        '<!--html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html"--><html>',
        '<html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html">',
    );

    const begin =
        '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - BEGIN ------------------------------------------- -->';
    const end =
        '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - END   ------------------------------------------- -->';
    let bigInsert = '';
    for (const widgetSet of config.widgetSets) {
        const name = `${typeof widgetSet === 'object' ? widgetSet.name : widgetSet}.html`;
        const file = readFileSync(`${adapterDir}/www/widgets/${name}`);
        bigInsert += `<!-- --------------${name}--- START -->\n${file.toString()}\n<!-- --------------${name}--- END -->\n`;
    }
    let pos = index.indexOf(begin);
    if (pos !== -1) {
        const start = index.substring(0, pos + begin.length);
        pos = index.indexOf(end);
        if (pos !== -1) {
            const _end = index.substring(pos);
            index = `${start}\n${bigInsert}\n${_end}`;

            const data = await readAdapterFile(fileName);
            if (data && data !== index) {
                writeFileSync(`${adapterDir}/www/${fileName}`, index);
                await adapter.writeFileAsync(adapterName, fileName, index);
                return true;
            }
        }
    }
    return false;
}

function upload(): Promise<number | null> {
    return new Promise(resolve => {
        adapter.log.info(`Upload ${adapter.name} anew, while changes detected...`);

        const file = join(utils.controllerDir, 'iobroker.js');
        const child = spawn('node', [file, 'upload', adapter.name, 'widgets']);
        let count = 0;
        child.stdout.on('data', (data: Buffer) => {
            count++;
            adapter.log.debug(data.toString().replace('\n', ''));
            if (!(count % 100)) {
                adapter.log.info(`${count} files uploaded...`);
            }
        });

        child.stderr.on('data', (data: Buffer) => adapter.log.error(data.toString().replace('\n', '')));

        child.on('exit', exitCode => {
            adapter.log.info(`Uploaded. ${exitCode ? `Exit - ${exitCode}` : 0}`);
            resolve(exitCode);
        });
    });
}

async function updateCacheManifest(): Promise<void> {
    adapter.log.info('Changes in index.html detected => update cache.manifest');
    let data = readFileSync(`${adapterDir}/www/cache.manifest`).toString();
    const build = data.match(/# dev build ([0-9]+)/);
    data = data.replace(/# dev build [0-9]+/, `# dev build ${(build ? parseInt(build[1], 10) : 0) + 1}`);
    writeFileSync(`${adapterDir}/www/cache.manifest`, data);

    await adapter.writeFileAsync(adapterName, 'cache.manifest', data);
}

// Update index.html and edit.html
async function checkFiles(configChanged: boolean): Promise<void> {
    const indexChanged = await writeFile('index.html');
    const editChanged = await writeFile('edit.html');
    if (indexChanged || editChanged || configChanged) {
        await updateCacheManifest();
        await upload();
    }
}

async function generatePages(): Promise<boolean> {
    let changed = !!syncWidgetSets(false);

    // upload config.js
    const stored = await readAdapterFile('js/config.js');
    const data = Buffer.isBuffer(stored) ? stored.toString('utf8') : stored || '';
    const config = existsSync(`${adapterDir}/www/js/config.js`)
        ? readFileSync(`${adapterDir}/www/js/config.js`).toString('utf8')
        : '';
    if (!data || data !== config) {
        changed = true;
        adapter.log.info('config.js changed. Upload.');
        await adapter.writeFileAsync(adapterName, 'js/config.js', config);
    }

    // create command variable
    const obj = await adapter.getObjectAsync('control.command');
    if (!obj) {
        await adapter.setObjectAsync('control.command', {
            type: 'state',
            common: {
                name: 'Command for vis',
                type: 'string',
                desc: "Writing this variable akt as the trigger. Instance and data must be preset before 'command' will be written. 'changedView' will be signalled too",
                role: 'state',
                read: true,
                write: true,
                states: {
                    alert: 'alert',
                    changeView: 'changeView',
                    refresh: 'refresh',
                    reload: 'reload',
                    dialog: 'dialog',
                    popup: 'popup',
                    playSound: 'playSound',
                    changedView: 'changedView',
                    tts: 'tts',
                },
            },
            native: {},
        });
    }

    // Create common user CSS file
    const cssData = await readAdapterFile('css/vis-common-user.css');
    if (cssData === null || cssData === undefined) {
        await adapter.writeFileAsync(adapterName, 'css/vis-common-user.css', '');
    }

    return changed;
}

async function main(): Promise<void> {
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
    void adapter.stop?.();
}

// If started as allInOne mode => return function to create instance
if (require.main !== module) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
