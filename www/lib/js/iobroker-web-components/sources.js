// @iobroker/web-components 0.8.0
/**
 * Where the web components of the installed adapters are
 *
 * An adapter lists its components in `common.webComponents` of its io-package.json: the manifest files, relative
 * to its admin folder. Admin and web both serve that folder as `/adapter/<name>/`, so every host loads them from
 * the same place; the file storage of ioBroker has them as `<name>.admin`, for a host that has neither:
 *
 * ```json
 * "common": { "webComponents": ["webcomponents/my-tile.json"] }
 * ```
 *
 * An entry may also be a module that exports its manifest (`.js`), as before 0.3.0, or an object with the manifest
 * file in `manifest` and a short form of the manifest (see `syncWebComponentEntries`).
 */
import { getWebComponentEntryFile } from './ioPackage.js';
/**
 * The adapter of an instance ID
 *
 * @param id like `system.adapter.my-adapter.0`
 */
function getAdapterName(id) {
    return id.replace(/^system\.adapter\./, '').replace(/\.\d+$/, '');
}
/**
 * The folder `adapter/` of the server, seen from the document of the host
 *
 * @param baseUrl URL of the document
 */
function getAdaptersFolder(baseUrl) {
    const url = new URL(baseUrl);
    // an admin tab is itself in such a folder: /adapter/devices/tab.html
    const tab = url.pathname.match(/^(.*\/)adapter\/[^/]+\//);
    return tab ? new URL(`${tab[1]}adapter/`, url) : new URL('../adapter/', url);
}
/**
 * Where the web components of the instances are
 *
 * @param instances the instance objects, e.g. of `getObjectViewSystem('instance', ...)`
 * @param baseUrl URL of the document. `../adapter/<name>/` is resolved against it, so a host under a path of its
 *   own (`/vis-2/`) and one at the root of the server both find the folder; a host that is an admin tab
 *   (`/adapter/devices/tab.html`) finds it next to its own folder. A reverse proxy's path prefix is kept.
 */
export function getWebComponentSources(instances, baseUrl) {
    const sources = [];
    const adaptersFolder = getAdaptersFolder(baseUrl);
    for (const instance of instances) {
        const list = instance?.common?.webComponents;
        if (!Array.isArray(list)) {
            continue;
        }
        const adapter = getAdapterName(instance._id);
        const adapterBase = new URL(`${adapter}/`, adaptersFolder);
        for (const entry of list) {
            const file = getWebComponentEntryFile(entry);
            if (!file) {
                continue;
            }
            const url = new URL(file, adapterBase).href;
            // every instance of an adapter lists the same files
            if (!sources.some(source => source.url === url)) {
                sources.push({ url, adapter, version: instance.common.version || '' });
            }
        }
    }
    return sources;
}
/**
 * The manifest files of the instances in the file storage of ioBroker - for a host that is served neither by web
 * nor by admin, or for a backend. An entry that is a module (`.js`) or leaves the admin folder is left out.
 *
 * @param instances the instance objects, e.g. of `getObjectViewSystem('instance', ...)`
 */
export function getWebComponentFiles(instances) {
    const files = [];
    const folder = 'http://host/admin/';
    for (const instance of instances) {
        const list = instance?.common?.webComponents;
        if (!Array.isArray(list)) {
            continue;
        }
        const adapter = getAdapterName(instance._id);
        for (const entry of list) {
            const file = getWebComponentEntryFile(entry);
            if (!file || !/\.json$/i.test(file)) {
                continue;
            }
            const url = new URL(file, folder);
            if (!url.href.startsWith(folder)) {
                continue;
            }
            const fileName = decodeURIComponent(url.pathname.substring('/admin/'.length));
            if (!files.some(file => file.adapter === adapter && file.fileName === fileName)) {
                files.push({ adapter, version: instance.common.version || '', id: `${adapter}.admin`, fileName });
            }
        }
    }
    return files;
}
