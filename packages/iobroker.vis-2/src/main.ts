/**
 *
 *      iobroker vis-2 Adapter
 *
 *      Copyright (c) 2021-2025, bluefox
 *
 *      CC-NC-BY 4.0 License
 *
 */
import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { normalize } from 'node:path';
import https from 'node:https';
import { verify } from 'jsonwebtoken';
import { syncWidgetSets } from './lib/install';

const ioPack: ioBroker.AdapterObject = JSON.parse(readFileSync(`${__dirname}/../io-package.json`).toString());

const cert = readFileSync(`${__dirname}/lib/cloudCert.crt`);

const POSSIBLE_WIDGET_SETS_LOCATIONS = [
    normalize(`${__dirname}/../../`),
    normalize(`${__dirname}/../node_modules/`),
    normalize(`${__dirname}/../../../`),
    normalize(`${__dirname}/../../../../`),
];

export interface VisAdapterConfig extends ioBroker.AdapterConfig {
    defaultFileMode: number;
    license: string;
    useLicenseManager: boolean;
    doNotShowProjectDialog: boolean;
    loadingBackgroundColor: string;
    loadingHideLogo: boolean;
    loadingBackgroundImage: boolean;
    forceBuild: boolean;
}

const wwwDir = existsSync(`${__dirname}/../www`) ? `${__dirname}/../www` : `${__dirname}/www`;

class VisAdapter extends Adapter {
    declare public visConfig: VisAdapterConfig;
    private widgetInstances: Record<string, string> = {};
    private stoppingPromise: null | (() => void) = null;
    private isLicenseError = false;
    private lastProgressUpdate: number = 0;
    private synchronizing = false;
    private synchronizingQueued: { forceBuild: boolean } | null = null;
    private vendorPrefix = '';

    constructor(options: Partial<AdapterOptions> = {}) {
        options = {
            ...options,
            name: 'vis-2',
            message: obj => this.processMessage(obj),
            unload: callback => {
                if (this.synchronizing) {
                    void new Promise<void>((resolve): void => {
                        this.stoppingPromise = resolve;
                    }).then(() => callback && callback());
                } else {
                    callback && callback();
                }
            },
            ready: () => void this.main(),
        };

        super({
            ...options,
            name: 'vis-2',
        });

        this.visConfig = this.config as VisAdapterConfig;
    }

    async objectChange(id: string, obj: ioBroker.Object | null | undefined): Promise<void> {
        // if it is an instance object
        if (
            id.startsWith('system.adapter.') &&
            id.match(/\d+$/) &&
            id !== 'system.adapter.vis.0' &&
            id !== 'system.adapter.vis-2.0'
        ) {
            if (obj && obj.type !== 'instance') {
                return;
            }
            id = id.substring('system.adapter.'.length).replace(/\.\d+$/, '');
            if (!obj?.common?.version) {
                if (this.widgetInstances[id]) {
                    delete this.widgetInstances[id];
                    await this.buildHtmlPages(false);
                }
            } else if (POSSIBLE_WIDGET_SETS_LOCATIONS.find(dir => existsSync(`${dir}/iobroker.${id}/widgets/`))) {
                // Check if the widgets folder exists
                // still exists
                if (!this.widgetInstances[id] || this.widgetInstances[id] !== obj.common.version) {
                    this.widgetInstances[id] = obj.common.version;
                    await this.buildHtmlPages(false);
                }
            } else if (this.widgetInstances[id]) {
                delete this.widgetInstances[id];
                await this.buildHtmlPages(false);
            }
        }
    }

    async processMessage(msg: ioBroker.Message): Promise<void> {
        if (msg?.command === 'checkLicense' && msg.message && msg.callback) {
            const obj = await this.getForeignObjectAsync(`system.adapter.${msg.message}.0`);
            if (!obj || !obj.native || (!obj.native.license && !obj.native.useLicenseManager)) {
                console.log(`[${msg.message}] License not found`);
                this.sendTo(msg.from, msg.command, { error: 'License not found' }, msg.callback);
            } else {
                const result = await this.checkL(obj.native.license, obj.native.useLicenseManager, msg.message);
                this.sendTo(msg.from, msg.command, { result }, msg.callback);
            }
        } else if (msg?.command === 'rebuild' && msg.callback) {
            if (!this.synchronizing) {
                this.sendTo(msg.from, msg.command, { result: 'done' }, msg.callback);
                await this.buildHtmlPages(true);
                this.log.warn('Force build done!');
            } else {
                this.sendTo(msg.from, msg.command, { error: 'already running' }, msg.callback);
            }
        }
    }

    static collectWidgetSets(
        dir: string,
        sets?: { path: string; name: string; pack: ioBroker.AdapterObject }[],
    ): { path: string; name: string; pack: ioBroker.AdapterObject }[] {
        sets = sets || [];
        if (!existsSync(dir)) {
            return sets;
        }
        const dirs: string[] = readdirSync(dir);
        dir = dir.replace(/\\/g, '/');
        if (!dir.endsWith('/')) {
            dir += '/';
        }
        for (let d = 0; d < dirs.length; d++) {
            const name = dirs[d].toLowerCase();
            const widgetPath = `${dir}${dirs[d]}/widgets/`;
            if (name.startsWith('iobroker.') && !sets.find(s => s.name === name) && existsSync(widgetPath)) {
                let pack;
                try {
                    pack = JSON.parse(readFileSync(`${dir}${dirs[d]}/io-package.json`).toString());
                } catch (e) {
                    pack = null;
                    console.warn(`Cannot parse "${dir}${dirs[d]}/io-package.json": ${e}`);
                }
                sets.push({ path: dir + dirs[d], name, pack });
            }
        }

        return sets;
    }

    async readAdapterList(): Promise<{ path: string; name: string; pack: ioBroker.AdapterObject }[]> {
        const res = await this.getObjectViewAsync('system', 'instance', {});

        const instances: string[] = [];
        res.rows.forEach(item => {
            const obj = item.value;
            // ignore widgets for V1 only
            if (
                obj?.common?.visWidgets &&
                Object.values(obj?.common?.visWidgets).find(w => w?.ignoreInVersions?.includes(2))
            ) {
                return;
            }
            const name = obj && obj._id && obj._id.replace('system.adapter.', '').replace(/\.\d+$/, '');
            if (name && !instances.includes(name)) {
                instances.push(name);
            }
        });

        instances.sort();

        let sets: { path: string; name: string; pack: ioBroker.AdapterObject }[] = [];
        POSSIBLE_WIDGET_SETS_LOCATIONS.forEach(dir => VisAdapter.collectWidgetSets(dir, sets));
        sets = sets.filter(s => instances.includes(s.name.substring('iobroker.'.length)));

        return sets;
    }

    async buildHtmlPages(forceBuild: boolean): Promise<void> {
        if (this.synchronizing) {
            this.synchronizingQueued = { forceBuild };
            return;
        }

        this.synchronizing = true;
        const enabledList = await this.readAdapterList();
        const configChanged = await this.generateConfigPage(forceBuild, enabledList);

        this.widgetInstances = {};
        enabledList.forEach(
            instance =>
                (this.widgetInstances[this.name.substring('iobroker.'.length)] = instance.pack?.common?.version),
        );

        const { widgetSets, filesChanged } = syncWidgetSets(enabledList, forceBuild);
        const widgetsChanged = await this.generateWidgetsHtml(widgetSets, forceBuild);

        let uploadedIndexHtml: string | null;
        let indexHtml = '';
        if (existsSync(`${wwwDir}/index.html`)) {
            indexHtml = readFileSync(`${wwwDir}/index.html`).toString('utf8');
            try {
                const file = await this.readFileAsync('vis-2', 'index.html');
                if (typeof file === 'object') {
                    uploadedIndexHtml = file.file.toString('utf8');
                } else {
                    uploadedIndexHtml = (file as string).toString();
                }
            } catch {
                // ignore
                uploadedIndexHtml = '';
            }
        } else {
            uploadedIndexHtml = '';
        }

        let uploadedEditHtml: string | null;
        let editHtml = '';
        if (existsSync(`${wwwDir}/edit.html`)) {
            editHtml = readFileSync(`${wwwDir}/edit.html`).toString('utf8');
            try {
                const file = await this.readFileAsync('vis-2', 'edit.html');
                if (typeof file === 'object') {
                    uploadedEditHtml = file.file.toString('utf8');
                } else {
                    uploadedEditHtml = (file as string).toString();
                }
            } catch {
                // ignore
                uploadedEditHtml = '';
            }
        } else {
            uploadedEditHtml = '';
        }

        if (
            configChanged ||
            widgetsChanged ||
            filesChanged ||
            uploadedIndexHtml !== indexHtml ||
            uploadedEditHtml !== editHtml ||
            forceBuild
        ) {
            try {
                await this.uploadAdapter();
            } catch (e) {
                this.log.error(`Could not upload adapter: ${e.message}`);
            }

            // terminate promise
            if (this.stoppingPromise) {
                if (typeof this.stoppingPromise === 'function') {
                    this.stoppingPromise();
                    this.stoppingPromise = null;
                }
                this.synchronizing = false;
                return;
            }

            await this.setState('info.uploaded', Date.now(), true);
        } else {
            const state = await this.getStateAsync('info.uploaded');
            if (!state || !state.val) {
                await this.setState('info.uploaded', Date.now(), true);
            }
        }
        this.synchronizing = false;
        if (typeof this.stoppingPromise === 'function') {
            this.stoppingPromise();
            this.stoppingPromise = null;
        } else if (this.synchronizingQueued && !this.visConfig.forceBuild) {
            const forceBuild = this.synchronizingQueued.forceBuild;
            this.synchronizingQueued = null;
            setImmediate(() => void this.buildHtmlPages(forceBuild));
        }
    }

    async generateWidgetsHtml(
        widgetSets: { name: string; depends?: string | string[]; always?: boolean; v2: boolean }[],
        forceBuild: boolean,
    ): Promise<boolean> {
        let text = '';
        for (let w = 0; w < widgetSets.length; w++) {
            const widgetSet = widgetSets[w];
            let file;
            const name = `${widgetSet.name}.html`;

            // ignore the HTML file if adapter has widgets for vis-1 and vis-2. Vis-2 will be loaded from js file and nor from html
            if (widgetSet.v2) {
                continue;
            }

            try {
                file = readFileSync(`${wwwDir}/widgets/${name}`);
                // extract all css and js

                // mark all scripts with data-widgetset attribute
                file = file.toString().replace(/<script/g, `<script data-widgetset="${name.replace('.html', '')}"`);

                text += `<!-- --------------${name}--- START -->\n${file.toString()}\n<!-- --------------${name}--- END -->\n`;
            } catch {
                this.log.warn(`Cannot read file www/widgets/${name}`);
            }
        }

        let data;
        try {
            data = await this.readFileAsync('vis-2', 'widgets.html');
        } catch {
            // ignore
        }
        if (typeof data === 'object') {
            data = data.file;
        }
        if (data && (data !== text || forceBuild)) {
            try {
                writeFileSync(`${wwwDir}/widgets.html`, text);
                // upload a file to DB
                await this.writeFileAsync('vis-2', 'www/widgets.html', text);
            } catch (e) {
                this.log.error(`Cannot write file www/widgets.html: ${e}`);
            }
            return true;
        } else if (
            !existsSync(`${wwwDir}/widgets.html`) ||
            readFileSync(`${wwwDir}/widgets.html`).toString() !== text
        ) {
            try {
                writeFileSync(`${wwwDir}/widgets.html`, text);
            } catch (e) {
                this.log.error(`Cannot write file www/widgets.html: ${e}`);
            }
        }

        return false;
    }

    async generateConfigPage(
        forceBuild: boolean,
        enabledList: { path: string; name: string; pack: ioBroker.AdapterObject }[],
    ): Promise<boolean> {
        let changed = forceBuild || false;

        // for back compatibility with vis.1 on cloud
        const widgetSets = ['basic', 'jqplot', 'jqui', 'swipe', 'tabs'];

        // collect vis-1 widgets
        enabledList.forEach(obj => {
            if (!obj.pack.common.visWidgets) {
                // find folder in widgets
                let widgetsPath = `${__dirname}/../node_modules/${obj.name}/widgets`;
                if (!existsSync(widgetsPath)) {
                    widgetsPath = `${__dirname}/../${obj.name}/widgets`;
                    if (!existsSync(widgetsPath)) {
                        widgetsPath = '';
                    }
                }
                if (widgetsPath) {
                    readdirSync(widgetsPath).forEach(file => {
                        if (file.match(/\.html$/)) {
                            const folderName = file.replace('.html', '');
                            !widgetSets.includes(folderName) && widgetSets.push(folderName);
                        }
                    });
                }
            }
        });

        const configJs = `window.isLicenseError = ${this.isLicenseError};
// inject the adapter instance
window.visAdapterInstance = ${this.instance};
window.vendorPrefix = '${this.vendorPrefix}';
window.disableDataReporting = ${(this.common as any)?.disableDataReporting ? 'true' : 'false'};
window.loadingBackgroundColor = '${this.visConfig.loadingBackgroundColor || ''}';
window.loadingBackgroundImage = '${this.visConfig.loadingBackgroundImage ? `files/${this.namespace}/loading-bg.png` : ''}';
window.loadingHideLogo = ${this.visConfig.loadingHideLogo ? 'true' : 'false'};
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
            const file = await this.readFileAsync('vis-2', 'config.js');
            if (typeof file === 'object') {
                currentConfigJs = file.file.toString('utf8');
            } else {
                currentConfigJs = file;
            }
        } catch {
            // ignore
            currentConfigJs = '';
        }

        if (!currentConfigJs || currentConfigJs !== configJs || forceBuild) {
            changed = true;
            this.log.info('config.js changed. Upload.');
            await this.writeFileAsync('vis-2', 'config.js', configJs);
            try {
                writeFileSync(`${wwwDir}/config.js`, configJs);
                if (!existsSync(`${wwwDir}/js`)) {
                    mkdirSync(`${wwwDir}/js`);
                }
                writeFileSync(`${wwwDir}/js/config.js`, configJs); // backwards compatibility with cloud
            } catch (e) {
                this.log.error(`Cannot write file www/config.js: ${e}`);
            }
        } else if (!existsSync(`${wwwDir}/config.js`) || readFileSync(`${wwwDir}/config.js`).toString() !== configJs) {
            try {
                writeFileSync(`${wwwDir}/config.js`, configJs);
                if (!existsSync(`${wwwDir}/js`)) {
                    mkdirSync(`${wwwDir}/js`);
                }
                writeFileSync(`${wwwDir}/js/config.js`, configJs); // backwards compatibility with cloud
            } catch (e) {
                this.log.error(`Cannot write file www/config.js: ${e}`);
            }
        }
        if (!existsSync(`${wwwDir}/js/config.js`) || readFileSync(`${wwwDir}/js/config.js`).toString() !== configJs) {
            try {
                !existsSync(`${wwwDir}/js`) && mkdirSync(`${wwwDir}/js`);
                writeFileSync(`${wwwDir}/js/config.js`, configJs); // backwards compatibility with cloud
            } catch (e) {
                this.log.error(`Cannot write file www/config.js: ${e}`);
            }
        }

        // Create common user CSS file
        let data;
        try {
            data = await this.readFileAsync(this.namespace, 'vis-common-user.css');
            if (typeof data === 'object') {
                data = data.file;
            }
        } catch {
            data = null;
        }

        if (data === null || data === undefined) {
            await this.writeFileAsync(this.namespace, 'vis-common-user.css', '');
        }

        return changed;
    }

    // delete this function as js.controller 4.0 will be mainstream
    async getSuitableLicensesEx(
        all: boolean,
        name: string,
    ): Promise<{ json: string; usedBy: string; invoice: string }[]> {
        // activate it again as js-controller 5.0.19 will be mainstream
        // return this.getSuitableLicenses(all, name);

        const licenses: {
            name: string;
            json: string;
            usedBy: string;
            invoice: string;
            decoded: {
                name: string;
                valid_till: string;
                version: string;
                uuid: string;
                invoice: string;
            };
        }[] = [];
        try {
            const obj = await this.getForeignObjectAsync('system.licenses');
            const uuidObj = await this.getForeignObjectAsync('system.meta.uuid');

            if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
                this.log.error('No UUID found!');
                return licenses;
            }
            const uuid: string = uuidObj.native.uuid;

            if (obj?.native?.licenses?.length) {
                const now = Date.now();
                const _obj = name
                    ? await this.getForeignObjectAsync(`system.adapter.${name === 'vis' ? 'vis-2' : name}`)
                    : null;

                let version: string;
                if (_obj?.common?.version) {
                    version = _obj.common.version.split('.')[0];
                } else {
                    version = this.pack?.version.split('.')[0] || '';
                }

                (
                    obj.native.licenses as {
                        name: string;
                        json: string;
                        usedBy: string;
                        invoice: string;
                        decoded: {
                            name: string;
                            valid_till: string;
                            version: string;
                            uuid: string;
                            invoice: string;
                        };
                    }[]
                ).forEach(license => {
                    try {
                        const decoded: {
                            name: string;
                            valid_till: string;
                            version: string;
                            uuid: string;
                            invoice: string;
                        } = verify(license.json, cert) as {
                            name: string;
                            valid_till: string;
                            version: string;
                            uuid: string;
                            invoice: string;
                        };
                        if (
                            decoded.name &&
                            (!decoded.valid_till ||
                                decoded.valid_till === '0000-00-00 00:00:00' ||
                                new Date(decoded.valid_till).getTime() > now)
                        ) {
                            if (
                                decoded.name.startsWith(`iobroker.${name || 'vis-2'}`) &&
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
                                        // exception if vis-1 has UUID, so it is valid for vis-2
                                        const exception =
                                            decoded.name === 'iobroker.vis' && version === '2' && decoded.uuid;

                                        if (!exception) {
                                            return;
                                        }
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
                        this.log.error(`Cannot decode license "${license.name}": ${err.message}`);
                    }
                });
            }
        } catch {
            // ignore
        }

        licenses.sort((a, b): 0 | 1 | -1 => {
            const aInvoice = a.decoded.invoice !== 'free';
            const bInvoice = b.decoded.invoice !== 'free';
            if (aInvoice === bInvoice) {
                return 0;
            }
            if (aInvoice) {
                return -1;
            }
            if (bInvoice) {
                return 1;
            }
            return 0;
        });

        return licenses;
    }

    async checkLicense(
        license: {
            name: string;
            version: string;
            expires: number;
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
            invoice: 'free' | string;
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
            type: 'commercial' | string;
            uuid: string;
        },
        uuid: string,
        originalError: Error | undefined,
        adapterName: string,
    ): Promise<boolean> {
        const _obj = adapterName
            ? await this.getForeignObjectAsync(`system.adapter.${adapterName === 'vis' ? 'vis-2' : adapterName}`)
            : null;
        let version;
        if (_obj?.common?.version) {
            version = _obj.common.version.split('.')[0];
        } else {
            version = this.version?.split('.')[0];
        }

        license.name = license.name.replace(/\.action$/, '');
        license.name = license.name.replace(/\.offline$/, '');

        if (license && license.expires * 1000 < new Date().getTime()) {
            this.log.error(`License error: Expired on ${new Date(license.expires * 1000).toString()}`);
            return true;
        }
        if (!license) {
            this.log.error(`License error: License is empty${originalError ? ` and ${originalError}` : ''}`);
            return true;
        }
        if (uuid.length !== 36 && license.invoice === 'free' && !uuid.startsWith('IO')) {
            this.log.error('Cannot use free license with commercial device!');
            return true;
        }
        if (license.name !== adapterName && license.name !== `iobroker.${adapterName}`) {
            this.log.error(`License is for other adapter "${license.name}". Expected "iobroker.${adapterName}"`);
            return true;
        }
        if (
            (license.type !== 'commercial' && version !== '1' && version !== license.version) ||
            (version === '1' &&
                license.version !== '&lt;2' &&
                license.version !== '<2' &&
                license.version !== '<1' &&
                license.version !== '<=1')
        ) {
            this.log.error(
                `License is for other adapter version "${license.name}@${license.version}". Expected "iobroker.${adapterName}@${version}"`,
            );
            return true;
        }
        const code = [];
        for (let i = 0; i < license.type.length; i++) {
            code.push(`\\u00${license.type.charCodeAt(i).toString(16)}`);
        }

        if (license.uuid && uuid !== license.uuid) {
            this.log.error(`License is for other device with UUID "${license.uuid}". This device has UUID "${uuid}"`);
            return true;
        }

        const t = '\u0063\u006f\u006d\u006d\u0065\u0072\u0063\u0069\u0061\u006c';
        if (t.length !== code.length) {
            originalError && this.log.error(`Cannot check license: ${originalError}`);
            return true;
        }
        for (let s = 0; s < code.length; s++) {
            if (code[s] !== `\\u00${t.charCodeAt(s).toString(16)}`) {
                originalError && this.log.error(`Cannot check license: ${originalError}`);
                return true;
            }
        }

        return false;
    }

    async check(license: string, uuid: string, originalError: Error | undefined, name: string): Promise<boolean> {
        try {
            const decoded: {
                name: string;
                version: string;
                expires: number;
                // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                invoice: 'free' | string;
                // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                type: 'commercial' | string;
                uuid: string;
            } = verify(license, readFileSync(`${__dirname}/lib/cloudCert.crt`)) as {
                name: string;
                version: string;
                expires: number;
                // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                invoice: 'free' | string;
                // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                type: 'commercial' | string;
                uuid: string;
            };
            return await this.checkLicense(decoded, uuid, originalError, name);
        } catch (err) {
            this.log.error(`Cannot check license: ${(originalError as Error) || (err as Error)}`);
            return true;
        }
    }

    async doLicense(license: string, uuid: string, adapterName: string): Promise<boolean> {
        let version = this.version?.split('.')[0] || '2';
        // take the version of checked adapter
        if (adapterName !== 'vis' && adapterName !== 'vis-2') {
            const obj = await this.getForeignObjectAsync(`system.adapter.${adapterName}.0`);
            if (obj?.common?.version) {
                version = obj.common.version.split('.')[0];
            } else {
                version = '1';
            }
        }

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
            const postReq = https
                .request(postOptions, res => {
                    res.setEncoding('utf8');
                    let result = '';
                    res.on('data', chunk => (result += chunk));

                    res.on('end', (): void => {
                        try {
                            const data = JSON.parse(result);
                            if (data.result === 'OK') {
                                data.name = data.name.replace(/\.action$/, '').replace(/\.offline$/, '');

                                if (data.name !== `iobroker.${adapterName}` && data.name !== adapterName) {
                                    this.log.error(
                                        `License is for other adapter "${data.name}". Expected "iobroker.${adapterName}"`,
                                    );
                                    resolve(true);
                                } else if (uuid.length !== 36 && uuid.substring(0, 2) !== 'IO') {
                                    try {
                                        const decoded: {
                                            name: string;
                                            version: string;
                                            expires: number;
                                            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                                            invoice: 'free' | string;
                                            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                                            type: 'commercial' | string;
                                            uuid: string;
                                        } = verify(license, readFileSync(`${__dirname}/lib/cloudCert.crt`)) as {
                                            name: string;
                                            version: string;
                                            expires: number;
                                            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                                            invoice: 'free' | string;
                                            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
                                            type: 'commercial' | string;
                                            uuid: string;
                                        };
                                        if (!decoded || decoded.invoice === 'free') {
                                            this.log.error('Cannot use free license with commercial device!');
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    } catch (err) {
                                        this.log.error(`Cannot check license: ${err}`);
                                        resolve(true);
                                    }
                                } else {
                                    this.log.info('vis-2 license is OK.');
                                    resolve(false);
                                }
                            } else {
                                this.log.error(
                                    `License is invalid! Nothing updated. Error: ${data ? data.error || data.result : 'unknown'}`,
                                );
                                resolve(true);
                            }
                        } catch (err: unknown) {
                            reject(new Error(err as string));
                        }
                    });

                    res.on('error', err => reject(err));
                })
                .on('error', err => reject(err));

            postReq.write(data);
            postReq.end();
        });
    }

    /**
     * Collect Files of an adapter-specific directory from the iobroker storage
     *
     * @param adapterPath path in the adapter-specific storage space
     * @param _result result as string
     */
    async collectExistingFilesToDelete(adapterPath: string, _result?: string[]): Promise<string[]> {
        _result = _result || [];
        let files: ioBroker.ReadDirResult[];

        if (this.stoppingPromise) {
            return _result;
        }

        try {
            this.log.debug(`Scanning ${adapterPath}`);
            files = await this.readDirAsync('vis-2', adapterPath);
        } catch {
            // ignore err
            files = [];
        }

        if (files?.length) {
            for (const file of files) {
                if (file.file === '.' || file.file === '..') {
                    continue;
                }
                const newPath: string = adapterPath + file.file;
                if (file.isDir) {
                    try {
                        const filesToDelete = await this.collectExistingFilesToDelete(`${newPath}/`);
                        _result = _result.concat(filesToDelete);
                    } catch (err) {
                        this.log.warn(`Cannot delete folder "${adapterPath}${newPath}/": ${err.message}`);
                    }
                } else if (!_result.includes(newPath)) {
                    _result.push(newPath);
                }
            }
        }

        return _result;
    }

    async eraseFiles(files: string[]): Promise<void> {
        if (files?.length) {
            const uploadID = 'system.adapter.vis-2.upload';

            await this.setForeignStateAsync(uploadID, 1, true);

            for (let f = 0; f < files.length; f++) {
                const file = files[f];
                if (file === '/index.html' || file === '/edit.html') {
                    continue;
                }
                if (this.stoppingPromise) {
                    return;
                }
                const now = Date.now();
                if (!this.lastProgressUpdate || now - this.lastProgressUpdate > 1000) {
                    this.lastProgressUpdate = now;
                    await this.setForeignStateAsync(
                        uploadID,
                        // upload starts from 0% and runs to 50% and round to 10th
                        Math.round((100 * (10 / 2) * f) / files.length) / 10,
                        true,
                    );
                }
                try {
                    await this.unlinkAsync('vis-2', file);
                } catch (err) {
                    this.log.error(`Cannot delete file "${file}": ${err}`);
                }
            }
            await this.setForeignStateAsync(uploadID, 50, true);
        }
    }

    async upload(files: string[]): Promise<void> {
        const uploadID = 'system.adapter.vis-2.upload';

        if (files.length) {
            await this.setForeignStateAsync(uploadID, 50, true);
        }

        const wwwLen = `${wwwDir}/`.length;

        for (let f = 0; f < files.length; f++) {
            const file = files[f];

            if (this.stoppingPromise) {
                return;
            }

            const attName = file.substring(wwwLen).replace(/\\/g, '/');
            if (attName === 'index.html' || attName === 'edit.html') {
                continue;
            }
            // write upload status into log
            if (files.length - f > 100) {
                (!f || !((files.length - f - 1) % 50)) &&
                    this.log.debug(`upload [${files.length - f - 1}] ${file.substring(wwwLen)} ${attName}`);
            } else if (files.length - f - 1 > 20) {
                (!f || !((files.length - f - 1) % 10)) &&
                    this.log.debug(`upload [${files.length - f - 1}] ${file.substring(wwwLen)} ${attName}`);
            } else {
                this.log.debug(`upload [${files.length - f - 1}] ${file.substring(wwwLen)} ${attName}`);
            }

            // Update upload indicator
            const now = Date.now();
            if (!this.lastProgressUpdate || now - this.lastProgressUpdate > 2000) {
                this.lastProgressUpdate = now;
                await this.setForeignStateAsync(
                    uploadID,
                    // upload starts from 50% and runs to 100%
                    50 + Math.round((100 * (10 / 2) * f) / files.length) / 10,
                    true,
                );
            }

            try {
                const data = readFileSync(file);
                await this.writeFileAsync('vis-2', attName, data);
            } catch (e) {
                this.log.error(`Error: Cannot upload ${file}: ${e.message}`);
            }
        }

        // Set upload progress to 0;
        if (files.length) {
            await this.setForeignStateAsync(uploadID, 0, true);
        }
    }

    // Read synchronous all files recursively from local directory
    walk(dir: string, _results?: string[]): string[] {
        const results = _results || [];

        if (this.stoppingPromise) {
            return results;
        }

        try {
            if (existsSync(dir)) {
                const list = readdirSync(dir);
                list.map(file => {
                    const stat = statSync(`${dir}/${file}`);
                    if (stat.isDirectory()) {
                        this.walk(`${dir}/${file}`, results);
                    } else {
                        if (
                            !file.endsWith('.npmignore') &&
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
    async uploadAdapter(): Promise<void> {
        if (!existsSync(wwwDir)) {
            return;
        }

        // Create "upload progress" object if not exists
        let obj;
        const _id = 'system.' + 'adapter.vis-2.upload';
        try {
            obj = await this.getForeignObjectAsync(_id);
        } catch {
            // ignore
        }
        if (!obj) {
            await this.setForeignObjectAsync(_id, {
                _id,
                type: 'state',
                common: {
                    name: 'vis-2.upload',
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
            } as ioBroker.StateObject);
        }

        await this.setForeignStateAsync(`system.adapter.vis-2.upload`, 0, true);

        let result;
        try {
            result = await this.getForeignObjectAsync('vis-2');
        } catch {
            // ignore
        }
        // Read all names with subtrees from the local directory
        const files = this.walk(wwwDir);
        if (!result) {
            await this.setForeignObjectAsync('vis-2', {
                _id: 'vis-2',
                type: 'meta',
                common: {
                    name: 'vis-2',
                    type: 'meta.folder',
                },
                native: {},
            });
        }

        const filesToDelete = await this.collectExistingFilesToDelete('/');
        this.log.debug(`Erasing files: ${filesToDelete.length}`);

        if (this.stoppingPromise) {
            return;
        }

        // write temp index.html and edit.html
        await this.writeFileAsync(
            'vis-2',
            'index.html',
            readFileSync(`${__dirname}/lib/updating.html`).toString('utf8'),
        );
        await this.writeFileAsync(
            'vis-2',
            'edit.html',
            readFileSync(`${__dirname}/lib/updating.html`).toString('utf8'),
        );

        // delete old files, before upload of new
        await this.eraseFiles(filesToDelete);
        await this.upload(files);

        if (this.stoppingPromise) {
            return;
        }

        // restore normal files
        await this.writeFileAsync('vis-2', 'index.html', readFileSync(`${wwwDir}/index.html`).toString('utf8'));
        await this.writeFileAsync('vis-2', 'edit.html', readFileSync(`${wwwDir}/edit.html`).toString('utf8'));
    }

    async copyFolder(sourceId: string, sourcePath: string, targetId: string, targetPath: string): Promise<void> {
        let files;
        try {
            files = await this.readDirAsync(sourceId, sourcePath);
        } catch {
            return;
        }

        for (let f = 0; f < files.length; f++) {
            if (files[f].isDir) {
                await this.copyFolder(
                    sourceId,
                    `${sourcePath}/${files[f].file}`,
                    targetId,
                    `${targetPath}/${files[f].file}`,
                );
            } else {
                const data = await this.readFileAsync(sourceId, `${sourcePath}/${files[f].file}`);
                await this.writeFileAsync(targetId, `${targetPath}/${files[f].file}`, data.file);
            }
        }
    }

    async checkL(license: string, useLicenseManager: boolean, name: string): Promise<boolean> {
        if (name === 'vis-2') {
            name = 'vis';
        }
        const uuidObj = await this.getForeignObjectAsync('system.meta.uuid');
        if (!uuidObj || !uuidObj.native || !uuidObj.native.uuid) {
            this.log.error('UUID not found!');
            return false;
        }
        if (useLicenseManager) {
            const result: { json: string; usedBy: string; invoice: string }[] = await this.getSuitableLicensesEx(
                true,
                name,
            );
            license = result[0]?.json;
        }

        if (!license) {
            this.log.error(`No license found for ${name}. Please get one on https://iobroker.net !`);
            return false;
        }
        try {
            return !(await this.doLicense(license, uuidObj.native.uuid, name));
        } catch (err: unknown) {
            return !(await this.check(license, uuidObj.native.uuid, (err as Error) || null, name));
        }
    }

    async exportFormOlderVersions(): Promise<void> {
        // Check if first start of vis-2
        let files: ioBroker.ReadDirResult[] | undefined;
        try {
            files = await this.readDirAsync('vis-2.0', '');
        } catch {
            // ignore
        }

        // if no files found, try to copy from vis-2-beta.0
        if (!files?.length) {
            // if vis-2-beta installed, copy files from vis-2-beta to vis-2
            try {
                files = await this.readDirAsync('vis-2-beta.0', '');
            } catch {
                // ignore
            }

            if (files?.length) {
                // copy recursive all
                await this.copyFolder('vis-2-beta.0', '', 'vis-2.0', '');
            } else {
                // try to copy from vis.0
                try {
                    files = await this.readDirAsync('vis.0', '');
                } catch {
                    // ignore
                }
                if (files?.length) {
                    // copy recursive all
                    await this.copyFolder('vis.0', '', 'vis-2.0', '');
                }
            }
        }
    }

    async main(): Promise<void> {
        this.visConfig = this.config as VisAdapterConfig;

        const visObj = await this.getForeignObjectAsync('vis-2');
        await this.setForeignStateAsync('system.adapter.vis-2.upload', 0, true);

        if (!existsSync(wwwDir)) {
            this.log.error(
                'Cannot find www folder. Looks like adapter was installed from github! Please install it from npm!',
            );
            return;
        }

        // create a vis "meta" object if not exists
        if (visObj?.type !== 'meta') {
            await this.setForeignObjectAsync('vis-2', {
                type: 'meta',
                common: {
                    name: 'vis-2 core files',
                    type: 'meta.user',
                },
                native: {},
            });
        }

        // create a vis-2.0 "meta" object, if not exists
        const visObjNS = await this.getForeignObjectAsync(this.namespace);
        if (visObjNS?.type !== 'meta') {
            await this.setForeignObjectAsync(this.namespace, {
                type: 'meta',
                common: {
                    name: 'user files and images for vis-2',
                    type: 'meta.user',
                },
                native: {},
            });
        }

        // repair chart view
        const systemView = await this.getForeignObjectAsync('_design/system');
        if (systemView?.views && !systemView.views.chart) {
            systemView.views.chart = {
                map: "function(doc) { if (doc.type === 'chart') emit(doc._id, doc) }",
            };
            await this.setForeignObjectAsync(systemView._id, systemView);
        }

        // Change running mode to daemon, enable messagebox and correct the local links
        const instanceObj = await this.getForeignObjectAsync(`system.adapter.${this.namespace}`);
        if (
            instanceObj?.common &&
            (instanceObj.common.mode !== 'daemon' || // mode must be "daemon"
                !instanceObj.common.messagebox || // messagebox must be enabled
                JSON.stringify(instanceObj.common.localLinks) !== JSON.stringify(ioPack.common.localLinks))
        ) {
            instanceObj.common.mode = 'daemon';
            instanceObj.common.messagebox = true;
            instanceObj.common.localLinks = ioPack.common.localLinks;

            await this.setForeignObjectAsync(instanceObj._id, instanceObj);
            // controller will do restart
            return;
        }

        let systemConfig;
        try {
            systemConfig = await this.getForeignObjectAsync('system.config');
        } catch (e) {
            this.log.warn(`Cannot read systemConfig: ${e}`);
        }

        if (!systemConfig) {
            this.log.error('Cannot find object system.config');
        }

        let uuid: ioBroker.Object | null | undefined = null;
        try {
            uuid = await this.getForeignObjectAsync('system.meta.uuid');
        } catch (e) {
            this.log.warn(`Cannot read UUID: ${e}`);
        }
        this.vendorPrefix =
            systemConfig?.native?.vendor?.uuidPrefix ||
            (uuid?.native?.uuid?.length > 36 ? uuid?.native.uuid.substring(0, 2) : '');

        // first check license
        if (
            !this.visConfig.useLicenseManager &&
            (!this.visConfig.license || typeof this.visConfig.license !== 'string')
        ) {
            this.isLicenseError = true;
            this.log.error('No license found for vis-2. Please get one on https://iobroker.net !');
        } else {
            this.isLicenseError = !(await this.checkL(this.visConfig.license, this.visConfig.useLicenseManager, 'vis'));
        }

        await this.exportFormOlderVersions();

        await this.buildHtmlPages(this.visConfig.forceBuild);

        if (this.visConfig.forceBuild) {
            this.log.warn('Force build done! Restarting...');
            await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, {
                native: { forceBuild: false },
            });
        } else {
            this.subscribeForeignObjects('system.adapter.*');
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<AdapterOptions> | undefined) => new VisAdapter(options);
} else {
    // otherwise start the instance directly
    (() => new VisAdapter())();
}
