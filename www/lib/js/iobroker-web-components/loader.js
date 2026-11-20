// @iobroker/web-components 0.8.0
/**
 * Loading web components in a host
 *
 * A component is described by a manifest file (`.json`) next to its module. A host reads the manifests to fill its
 * palette and its settings, and imports a module only when it shows the element - so no code of a component runs
 * before it is used. Older components are a module that exports its manifest: such a module is imported at once.
 */
import { checkManifest } from './manifest.js';
/**
 * The native `import()`. `@vite-ignore`, because the URL is only known at runtime; and the URL must be absolute:
 * a relative one would be resolved against this file, not against the document.
 *
 * @param url absolute URL of the module
 */
const nativeImport = url => import(/* @vite-ignore */ url);
/**
 * `fetch()` of the browser
 *
 * @param url absolute URL of the manifest file
 */
const nativeRead = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
};
/**
 * Whether a source is a manifest file - else it is a module that exports its manifest
 *
 * @param url URL of the source
 */
export function isManifestFile(url) {
    return /\.json$/i.test(url.split(/[?#]/)[0]);
}
/** The modules imported or being imported, by URL: every module is imported once */
const imports = new Map();
/**
 * Read the manifest of one component; a module that exports its manifest is imported for it
 *
 * @param source where the component is described
 * @param options how to read, load and where to report
 * @returns the component, or null if it cannot be used - the reason went to the log
 */
export async function loadWebComponent(source, options = {}) {
    const log = options.log || console;
    try {
        if (isManifestFile(source.url)) {
            const manifest = await (options.readManifest || nativeRead)(source.url);
            const problem = checkManifest(manifest) ||
                (manifest.module ? null : 'module is missing: the file of the element');
            if (problem) {
                log.error(`Web component ${source.url} ignored: ${problem}`);
                return null;
            }
            const valid = manifest;
            return { ...source, manifest: valid, moduleUrl: new URL(valid.module, source.url).href };
        }
        const module = await (options.importer || nativeImport)(source.url);
        const problem = checkManifest(module?.manifest);
        if (problem || !module.manifest) {
            log.error(`Web component ${source.url} ignored: ${problem}`);
            return null;
        }
        if (!customElements.get(module.manifest.tag)) {
            log.error(`Web component ${source.url} ignored: it does not define <${module.manifest.tag}>`);
            return null;
        }
        imports.set(source.url, Promise.resolve());
        return { ...source, manifest: module.manifest, moduleUrl: source.url };
    }
    catch (e) {
        log.error(`Cannot load web component ${source.url}: ${e?.message || String(e)}`);
        return null;
    }
}
/**
 * Read several components side by side; a tag that two of them bring is taken from the first one only
 *
 * @param sources where the components are described, in the order of preference
 * @param options how to read, load and where to report
 */
export async function loadWebComponents(sources, options = {}) {
    const log = options.log || console;
    const loaded = await Promise.all(sources.map(source => loadWebComponent(source, options)));
    const result = [];
    for (const component of loaded) {
        if (!component) {
            continue;
        }
        if (result.some(other => other.manifest.tag === component.manifest.tag)) {
            log.warn(`Web component <${component.manifest.tag}> of ${component.url} ignored: already loaded`);
            continue;
        }
        result.push(component);
    }
    return result;
}
/**
 * Import the module of a component - once, however often it is asked - so that its element is defined
 *
 * A host calls it before it creates the element: then the element has its class when it gets its properties.
 * Rejects if the module cannot be loaded or does not define the tag of the manifest; it may be tried again later.
 *
 * @param component the component, as `loadWebComponents` gave it
 * @param options how to load a module
 */
export function importWebComponent(component, options = {}) {
    const { moduleUrl, manifest } = component;
    let promise = imports.get(moduleUrl);
    if (!promise) {
        promise = (options.importer || nativeImport)(moduleUrl).then(() => {
            if (!customElements.get(manifest.tag)) {
                throw new Error(`${moduleUrl} does not define <${manifest.tag}>`);
            }
        });
        imports.set(moduleUrl, promise);
        // a failed import is tried again the next time
        promise.catch(() => imports.delete(moduleUrl));
    }
    return promise;
}
/**
 * Read the manifests from the file storage of ioBroker - for a host that is served neither by web nor by admin,
 * or for a backend. The modules still need a URL to be imported in a browser.
 *
 * @param files where the manifests are, see `getWebComponentFiles`
 * @param readFile reads a file as text, e.g. `(id, name) => adapter.readFileAsync(id, name).then(r => r.file.toString())`
 * @param log where problems are reported, `console` if not given
 */
export async function readWebComponentManifests(files, readFile, log = console) {
    const result = [];
    for (const file of files) {
        try {
            const manifest = JSON.parse(await readFile(file.id, file.fileName));
            const problem = checkManifest(manifest);
            if (problem) {
                log.error(`Web component ${file.id}/${file.fileName} ignored: ${problem}`);
            }
            else {
                result.push({ file, manifest: manifest });
            }
        }
        catch (e) {
            log.error(`Cannot read web component ${file.id}/${file.fileName}: ${e?.message || String(e)}`);
        }
    }
    return result;
}
