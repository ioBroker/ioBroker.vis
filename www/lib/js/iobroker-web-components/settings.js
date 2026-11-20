// @iobroker/web-components 0.8.0
/**
 * The values of the settings: which there are, their defaults, and their types
 */
import { DECORATION_TYPES, getSettingsGroups } from './manifest.js';
/**
 * The fields of one panel that carry a value, with their types - e.g. of the form of a dialog
 *
 * @param panel a JSON-Config panel
 */
export function getPanelSettingTypes(panel) {
    const types = {};
    for (const [name, setting] of Object.entries(panel.items || {})) {
        if (setting && !DECORATION_TYPES.includes(setting.type)) {
            types[name] = setting.type;
        }
    }
    return types;
}
/**
 * The settings that carry a value - what the element gets in `settings` - with their types
 *
 * @param manifest the manifest of the component
 */
export function getSettingTypes(manifest) {
    const types = {};
    for (const { panel } of getSettingsGroups(manifest)) {
        Object.assign(types, getPanelSettingTypes(panel));
    }
    return types;
}
/**
 * The defaults of the settings, for a new instance of the component
 *
 * @param manifest the manifest of the component
 */
export function getDefaultSettings(manifest) {
    const settings = {};
    for (const { panel } of getSettingsGroups(manifest)) {
        for (const [name, setting] of Object.entries(panel.items || {})) {
            if (setting && !DECORATION_TYPES.includes(setting.type) && setting.default !== undefined) {
                settings[name] = setting.default;
            }
        }
    }
    return settings;
}
function toText(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }
    return JSON.stringify(value);
}
/**
 * The value of a setting in the type the manifest declares, or undefined if it has none
 *
 * A host may keep what is typed into a field, or what a binding delivers, as text. The component gets the type
 * its manifest declares instead, so it never has to guess: a number for `number` and `slider`, a boolean for
 * `checkbox`, a string for everything else.
 *
 * @param type type of the setting
 * @param value the value as the host holds it
 */
export function toSettingValue(type, value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    switch (type) {
        case 'number':
        case 'slider': {
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : undefined;
            }
            const text = toText(value).trim().replace(',', '.');
            if (!text) {
                return undefined;
            }
            const num = Number(text);
            return Number.isFinite(num) ? num : undefined;
        }
        case 'checkbox':
            return value === true || value === 'true' || value === 1 || value === '1';
        default:
            return toText(value);
    }
}
/**
 * The settings object for the element out of the values a host holds
 *
 * Only the settings of the manifest are taken; a setting without a value is left out.
 *
 * @param types the settings and their types, see {@link getSettingTypes}
 * @param values the values as the host holds them
 */
export function toSettings(types, values) {
    const settings = {};
    for (const [name, type] of Object.entries(types)) {
        const value = toSettingValue(type, values[name]);
        if (value !== undefined) {
            settings[name] = value;
        }
    }
    return settings;
}
