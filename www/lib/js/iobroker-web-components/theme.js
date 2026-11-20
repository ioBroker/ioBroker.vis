// @iobroker/web-components 0.8.0
const FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';
/** What a component gets from a light host that sets no theme: the light theme of ioBroker */
const LIGHT_THEME = Object.freeze({
    type: 'light',
    primary: '#3399CC',
    primaryContrast: '#FFFFFF',
    secondary: '#164477',
    secondaryContrast: '#FFFFFF',
    background: '#FFFFFF',
    paper: '#FFFFFF',
    text: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    divider: 'rgba(0, 0, 0, 0.12)',
    error: '#D32F2F',
    warning: '#ED6C02',
    info: '#0288D1',
    success: '#2E7D32',
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    borderRadius: 4,
});
/** What a component gets from a host that only says `dark`: the dark theme of ioBroker */
const DARK_THEME = Object.freeze({
    type: 'dark',
    primary: '#4DABF5',
    primaryContrast: 'rgba(0, 0, 0, 0.87)',
    secondary: '#436A93',
    secondaryContrast: '#FFFFFF',
    background: '#121212',
    paper: '#121212',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    divider: 'rgba(255, 255, 255, 0.12)',
    error: '#F44336',
    warning: '#FFA726',
    info: '#29B6F6',
    success: '#66BB6A',
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    borderRadius: 4,
});
/** The fields of a theme that hold a color or a font, in the order of the CSS variables */
const TEXT_FIELDS = [
    'primary',
    'primaryContrast',
    'secondary',
    'secondaryContrast',
    'background',
    'paper',
    'text',
    'textSecondary',
    'divider',
    'error',
    'warning',
    'info',
    'success',
    'fontFamily',
];
/** The fields of a theme that hold a size in px */
const PIXEL_FIELDS = ['fontSize', 'borderRadius'];
/**
 * The theme a component gets when the host says no more than light or dark
 *
 * @param type `dark` or `light`; anything else is `light`
 */
export function getDefaultTheme(type) {
    return { ...(type === 'dark' ? DARK_THEME : LIGHT_THEME) };
}
/**
 * Whatever a host set as `theme`, as a complete theme: an object with missing or broken fields gets them from the
 * default of its type, the strings `light` and `dark` of hosts older than the object get the default
 *
 * @param theme what the host set
 */
export function toWebComponentTheme(theme) {
    if (!theme || typeof theme !== 'object') {
        return getDefaultTheme(typeof theme === 'string' ? theme : 'light');
    }
    const given = theme;
    const result = getDefaultTheme(typeof given.type === 'string' ? given.type : 'light');
    for (const field of TEXT_FIELDS) {
        const value = given[field];
        if (typeof value === 'string' && value.trim()) {
            result[field] = value.trim();
        }
    }
    for (const field of PIXEL_FIELDS) {
        const raw = given[field];
        // MUI allows `borderRadius: '4px'`
        const value = typeof raw === 'string' ? parseFloat(raw) : raw;
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
            result[field] = value;
        }
    }
    return result;
}
/**
 * True if both themes have the same values - a host may hand over a new object on every render
 *
 * @param a one theme
 * @param b the other
 */
export function isSameTheme(a, b) {
    return (a.type === b.type &&
        TEXT_FIELDS.every(field => a[field] === b[field]) &&
        PIXEL_FIELDS.every(field => a[field] === b[field]));
}
/**
 * The theme of a host built with MUI (vis-2, devices, admin) for its web components
 *
 * @param muiTheme the theme of the host, e.g. from `useTheme()`
 */
export function getWebComponentTheme(muiTheme) {
    const palette = muiTheme?.palette;
    return toWebComponentTheme({
        type: palette?.mode === 'dark' ? 'dark' : 'light',
        primary: palette?.primary?.main,
        primaryContrast: palette?.primary?.contrastText,
        secondary: palette?.secondary?.main,
        secondaryContrast: palette?.secondary?.contrastText,
        background: palette?.background?.default,
        paper: palette?.background?.paper,
        text: palette?.text?.primary,
        textSecondary: palette?.text?.secondary,
        divider: palette?.divider,
        error: palette?.error?.main,
        warning: palette?.warning?.main,
        info: palette?.info?.main,
        success: palette?.success?.main,
        fontFamily: muiTheme?.typography?.fontFamily,
        fontSize: muiTheme?.typography?.fontSize,
        borderRadius: muiTheme?.shape?.borderRadius,
    });
}
/** `textSecondary` -> `--iob-text-secondary` */
function toVariable(field) {
    return `--iob-${field.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
}
/**
 * The theme as CSS custom properties: `--iob-primary`, `--iob-paper`, `--iob-font-family`, `--iob-font-size` (px),
 * ... and `color-scheme`. Set on the element, they reach into its shadow DOM: `color: var(--iob-primary)`.
 *
 * @param theme the theme
 * @returns the properties by name
 */
export function getThemeCssVariables(theme) {
    const result = {};
    for (const field of TEXT_FIELDS) {
        result[toVariable(field)] = theme[field];
    }
    for (const field of PIXEL_FIELDS) {
        result[toVariable(field)] = `${theme[field]}px`;
    }
    result['color-scheme'] = theme.type;
    return result;
}
