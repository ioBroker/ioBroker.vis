/**
 * This file contains shared utils between edit and runtime
 */
import type { CSSProperties } from '@mui/styles';
import { store } from '@/Store';
import {
    GroupWidget, Widget, Project, SingleWidget, SingleWidgetId, GroupWidgetId, AnyWidgetId, Permissions,
} from '@/types';

/** Default OID if no selected */
export const NOTHING_SELECTED = 'nothing_selected';

/**
 * Adds an overflow visible attribute if no specific overflow is present,
 * else it deletes the general overflow, so the specific one can take effect
 *
 * @param style the style to modify
 */
export function calculateOverflow(style: CSSProperties): void {
    if (!style.overflowX && !style.overflowY) {
        style.overflow = 'visible';
    } else if (style.overflow) {
        delete style.overflow;
    }
}

/**
 * Check, that given number is not Infinity or NaN
 *
 * @param numberOrString number or string to check
 */
export function isVarFinite(numberOrString: number | string): boolean {
    // the difference between Number.isFinite and window.isFinite is that window.isFinite tries to convert the parameter to a number
    // and Number.isFinite does not and just check against non NaN and non Infinity

    // eslint-disable-next-line no-restricted-properties
    return window.isFinite(numberOrString as number);
}

/**
 * Check if passed Widget is a group
 *
 * @param widget widget to check
 */
export function isGroup(widget: Widget): widget is GroupWidget {
    return widget.tpl === '_tplGroup';
}

/**
 * Stringify-parse copy with type inference
 *
 * @param object The object which should be cloned
 */
export function deepClone<T extends Record<string, any>>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Get next widgetId as a number
 *
 * @param isWidgetGroup if it is a group of widgets
 * @param project current project
 * @param offset offset if multiple widgets are created and not yet in project
 */
export function getNewWidgetIdNumber(isWidgetGroup: boolean, project: Project, offset = 0): number  {
    const widgets: string[] = [];
    project = project || store.getState().visProject;
    Object.keys(project).forEach(view =>
        project[view].widgets && Object.keys(project[view].widgets).forEach(widget =>
            widgets.push(widget)));
    let newKey = 1;
    widgets.forEach(name => {
        const matches = isWidgetGroup ? name.match(/^g([0-9]+)$/) : name.match(/^w([0-9]+)$/);
        if (matches) {
            const num = parseInt(matches[1], 10);
            if (num >= newKey) {
                newKey = num + 1;
            }
        }
    });

    return newKey + offset;
}

/**
 * Get new widget id from the project
 * @param project project to determine next widget id for
 * @param offset offset, if multiple widgets are created and not yet in the project
 */
export function getNewWidgetId(project: Project, offset = 0): SingleWidgetId {
    const newKey = getNewWidgetIdNumber(false, project, offset);

    return `w${(newKey).toString().padStart(6, '0')}`;
}

/**
 * Get new group id from the project
 * @param project project to determine next group id for
 * @param offset offset, if multiple groups are created and not yet in the project
 */
export function getNewGroupId(project: Project, offset = 0): GroupWidgetId {
    const newKey = getNewWidgetIdNumber(true, project, offset);

    return `g${newKey.toString().padStart(6, '0')}`;
}

interface CopyWidgetOptions {
    /** The widgets key, value object to copy the group to */
    widgets: Record<string, Widget>;
    /** The offset to use, if multiple groups are copied without saving */
    offset?: number;
    /** The project to calculate new widget ids from */
    project: Project;
}

interface CopySingleWidgetOptions extends CopyWidgetOptions {
    /** The widget which should be copied */
    widget: SingleWidget;
    /** ID of the selected group if one is active */
    selectedGroup?: GroupWidgetId;
}

interface CopyGroupOptions extends CopyWidgetOptions {
    /** The group which should be copied */
    group: GroupWidget;
    /** The group member widgets stored in the clipboard to paste from */
    groupMembers: Record<string, Widget>;
}

/**
 * Paste a single widget into the given widgets key, value object
 * Returns the new widget id
 *
 * @param options selected group, widgets and offset information
 */
export function pasteSingleWidget(options: CopySingleWidgetOptions): string {
    const  {
        widgets, offset, project, widget, selectedGroup,
    } = options;

    const newKey = getNewWidgetId(project, offset);

    if (selectedGroup && isGroup(widgets[selectedGroup])) {
        widget.grouped = true;
        widget.groupid = selectedGroup;
        (widgets[selectedGroup] as GroupWidget).data.members.push(newKey);
    }

    widgets[newKey] = widget;

    return newKey;
}

/**
 * Paste a group and all the members into the given widgets key, value object
 * Returns the new group id
 *
 * @param options group, widgets and offset information
 */
export function pasteGroup(options: CopyGroupOptions): string {
    const  {
        widgets, group, groupMembers, offset, project,
    } = options;
    const newGroupId = getNewGroupId(project, offset ?? 0);

    for (let i = 0; i < group.data.members.length; i++) {
        const wid = group.data.members[i];
        const newMember = deepClone(groupMembers[wid]);

        const newMemberId = getNewWidgetId(project, i);

        newMember.groupid = newGroupId;
        group.data.members[i] = newMemberId;
        widgets[newMemberId] = newMember;
    }

    widgets[newGroupId] = group;

    return newGroupId;
}

/**
 * Removes all special structures from the project
 *
 * @param project the project to remove special structures from
 */
export function unsyncMultipleWidgets(project: Project): Project {
    project = deepClone(project || store.getState().visProject);
    for (const  [viewName, view] of Object.entries(project)) {
        if (viewName === '___settings') {
            continue;
        }

        for (const widgetId of Object.keys(view.widgets)) {
            if (widgetId.includes('_')) {
                delete view.widgets[widgetId as AnyWidgetId];
            }
        }
    }

    return project;
}

interface CheckAccessOptions {
    /** The project the user wants to access */
    project: Project;
    /** The active user */
    user: string;
    /** True if running in edit mode */
    editMode: boolean;
}

/** Default permissions if no given, user has full access */
export const DEFAULT_PERMISSIONS: Permissions = { read: true, write: true };

/**
 * Check if the user has access to the project in given mode
 *
 * @param options project, user and mode information
 */
export function hasProjectAccess(options: CheckAccessOptions): boolean {
    const { project, user, editMode } = options;

    const permissions = project.___settings.permissions?.[user] ?? DEFAULT_PERMISSIONS;

    if (editMode && permissions.write) {
        return true;
    }

    return !editMode && permissions.read;
}

interface CheckViewAccessOptions extends CheckAccessOptions{
    /** Name of the view */
    view: string;
}

interface CheckWidgetAccessOptions extends CheckViewAccessOptions {
    /** Widget ID */
    wid: AnyWidgetId;
}

/**
 * Check if the user has access to the view in given mode
 *
 * @param options project, view, user and mode information
 */
export function hasViewAccess(options: CheckViewAccessOptions): boolean {
    const {
        project, user, editMode, view,
    } = options;

    const permissions = project[view]?.settings?.permissions?.[user] ?? DEFAULT_PERMISSIONS;

    if (editMode && permissions.write) {
        return true;
    }

    return !editMode && permissions.read;
}

/**
 * Check if the user has access to the widget in given mode
 *
 * @param options project, view, widget, user and mode information
 */
export function hasWidgetAccess(options: CheckWidgetAccessOptions): boolean {
    const {
        project, user, editMode, view, wid,
    } = options;

    const permissions = project[view]?.widgets[wid]?.permissions?.[user] ?? DEFAULT_PERMISSIONS;

    if (editMode && permissions.write) {
        return true;
    }

    return !editMode && permissions.read;
}
