// @iobroker/web-components 0.8.0
/** The types of settings whose options the host asks an instance for */
export const SEND_TO_TYPES = ['selectSendTo', 'autocompleteSendTo'];
/**
 * A text with `${data.x}` in it, filled with the values of the settings - as patterns of JSON-Config
 *
 * @param pattern the text
 * @param data the values of all settings
 */
export function fillPattern(pattern, data) {
    if (!pattern.includes('${')) {
        return pattern;
    }
    const fn = new Function('data', `return \`${pattern.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`;`);
    return fn(data);
}
/**
 * The request for the options of a setting, or null if the setting asks no instance or the request cannot be made
 * yet (e.g. `instance` is `${data.instance}` and no instance is chosen)
 *
 * @param setting the setting from the manifest
 * @param data the values of all settings, as the host holds them
 * @param adapter the adapter that brings the component - the instance asked when the setting names none
 */
export function getSendToRequest(setting, data, adapter) {
    if (!setting || !SEND_TO_TYPES.includes(setting.type)) {
        return null;
    }
    const values = data || {};
    try {
        const instance = (setting.instance ? fillPattern(setting.instance, values) : `${adapter}.0`)
            .trim()
            .replace(/^system\.adapter\./, '');
        if (!/^[a-z0-9][a-z0-9._-]*\.\d+$/i.test(instance)) {
            return null;
        }
        let message = null;
        if (setting.jsonData) {
            message = JSON.parse(fillPattern(setting.jsonData, values));
        }
        else if (setting.data !== undefined) {
            message = setting.data;
        }
        const command = setting.command || 'send';
        const depends = (setting.alsoDependsOn || []).map(name => values[name] ?? null);
        return { instance, command, data: message, key: JSON.stringify([instance, command, message, depends]) };
    }
    catch {
        // a pattern that does not evaluate, or jsonData that is no JSON
        return null;
    }
}
/**
 * The options in the answer of the instance: `[{ value, label }]` as in JSON-Config; a plain value is its own label.
 * Anything else gives no options.
 *
 * @param answer what `sendTo` returned
 */
export function toSendToOptions(answer) {
    if (!Array.isArray(answer)) {
        return [];
    }
    const options = [];
    for (const item of answer) {
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            options.push({ value: item, label: String(item) });
        }
        else if (item && typeof item === 'object') {
            const { value, label } = item;
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                const text = typeof label === 'string' || (label && typeof label === 'object')
                    ? label
                    : String(value);
                options.push({ value, label: text });
            }
        }
    }
    return options;
}
