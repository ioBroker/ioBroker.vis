import { store } from '@/Store';
import { GroupWidget, Widget, Project } from '@/types';

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
function getNewWidgetIdNumber(isWidgetGroup: boolean, project: Project, offset = 0): number  {
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
 * @return {string}
 */
export function getNewWidgetId(project: Project, offset = 0): string {
    const newKey = getNewWidgetIdNumber(false, project, offset);

    return `w${(newKey).toString().padStart(6, '0')}`;
}

/**
 * Get new group id from the project
 * @param project project to determine next group id for
 * @param offset offset, if multiple groups are created and not yet in the project
 */
export function getNewGroupId(project: Project, offset = 0): string {
    const newKey = getNewWidgetIdNumber(true, project, offset);

    return `g${newKey.toString().padStart(6, '0')}`;
}

interface CopyGroupOptions {
    /** The group which should be copied */
    group: GroupWidget;
    /** The widgets key, value object to copy the group to */
    widgets: Record<string, Widget>;
    /** The group member widgets stored in the clipboard to paste from */
    groupMembers: Record<string, Widget>,
    /** The offset to use, if multiple groups are copied without saving */
    offset?: number
    /** The project to calculate new widget ids from */
    project: Project
}

/**
 * Paste a group and all the members into the given widgets key, value object
 *
 * @param options group, widgets and offset information
 */
export function pasteGroup(options: CopyGroupOptions): void {
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
                delete view.widgets[widgetId];
            }
        }
    }

    return project;
}
