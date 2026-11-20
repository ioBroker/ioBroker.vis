// @iobroker/web-components 0.8.0
/**
 * React for web components that are written with React: web and admin serve one shared copy per major, so a
 * component does not have to bring its own.
 */
/** Where web and admin serve React 19 - react, react-dom, react-dom/client and react/jsx-runtime in one module */
export const REACT_19_URL = '/lib/esm/react-19.js';
/** Where web and admin serve React 18 - the same four modules, for components and hosts still on React 18 */
export const REACT_18_URL = '/lib/esm/react-18.js';
/** The imports a React web component maps onto {@link getReactImportPath} instead of bundling them */
export const REACT_SPECIFIERS = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'];
/**
 * The shared React as a component module imports it: relative to the module itself.
 *
 * A host loads a module from `<base>/adapter/<adapter>/<modulePath>`, and `<base>/lib/esm/` lies beside
 * `<base>/adapter/` - in web, in admin and in every other host. The browser resolves a relative import against
 * the URL of the module, so the import keeps `<base>`: the path prefix of a reverse proxy
 * (`https://example.com/iob/`), which the absolute {@link REACT_19_URL} would miss.
 *
 * The import is resolved while the module is evaluated, before a host could hand the element anything - so the
 * path comes from the URL of the module, not from a property.
 *
 * @param modulePath where the built module lies in the admin folder of its adapter, e.g. `webcomponents/my-tile.js`
 * @param major the major of React: 19 if not given, 18 for a component still on React 18
 * @returns e.g. `../../../lib/esm/react-19.js` for `webcomponents/my-tile.js`
 */
export function getReactImportPath(modulePath, major = 19) {
    const parts = modulePath
        .replace(/\\/g, '/')
        .split('/')
        .filter(part => part && part !== '.');
    if (!parts.length || parts.includes('..')) {
        throw new Error(`"${modulePath}" is not a path in the admin folder of the adapter`);
    }
    // the folders of the module in the admin folder, then `<adapter>/` and `adapter/`
    return `${'../'.repeat(parts.length - 1 + 2)}lib/esm/react-${major}.js`;
}
