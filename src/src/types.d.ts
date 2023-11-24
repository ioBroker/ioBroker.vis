export interface ProjectSettings {
    darkReloadScreen: boolean;
    destroyViewsAfter: number;
    folders: {id: string, name: string, parentId: string}[];
    openedViews: string[];
    reconnectInterval: number;
    reloadOnEdit: boolean;
    reloadOnSleep: number;
    statesDebounceTime: number;
}

interface SingleWidget  {
    data: Record<string, unknown>;
    style: Record<string, unknown>;
    tpl: string;
    widgetSet: string;
    /** The id of the group, if the widget is grouped */
    groupid?: string;
}

interface GroupWidget extends SingleWidget {
    tpl: '_tplGroup';
    data: {
        /** Widget IDs of the members */
        members: string[];
        [other: string]: unknown
    }
}

export type Widget = SingleWidget | GroupWidget;

export interface View {
    activeWidgets: string[];
    filterList: string[];
    rerender: boolean;
    settings: Record<string, unknown>;
    widgets: Record<string, Widget>;
}

export interface Project {
    // @ts-expect-error this type has bad code-style, we should refactor the views in a views: Record<string, View> attribute
    ___settings: ProjectSettings;
    [view: string]: View;
}
