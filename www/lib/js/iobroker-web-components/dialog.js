// @iobroker/web-components 0.8.0
/** The event with which the content of an element dialog closes it; `detail` is the result */
export const DIALOG_CLOSE_EVENT = 'iob-dialog-close';
/**
 * The event with which a component asks the host to show one of its views, e.g. after a click;
 * `detail` is a `WebComponentNavigateDetail`. A host that has views shows it and calls `preventDefault()`,
 * one without views ignores the event
 */
export const NAVIGATE_EVENT = 'iob-navigate';
/**
 * The event with which a component changes the value it edits; `detail` is the new value, JSON. A host that stores
 * values (JSON-Config) stores it and calls `preventDefault()` - the component then takes it as its `value` itself.
 * A host without values ignores it
 */
export const CHANGE_EVENT = 'iob-change';
/**
 * Whether the host renders the dialog itself (a form) or frames an element of the component
 *
 * @param request what the component asked for
 */
export function isFormDialog(request) {
    return !!request.form;
}
