import { createReducer, configureStore, createAction } from '@reduxjs/toolkit';

interface ProjectSettings {
    darkReloadScreen: boolean;
    destroyViewsAfter: number;
    folders: {id: string, name: string, parentId: string}[];
    openedViews: string[];
    reconnectInterval: number;
    reloadOnEdit: boolean;
    reloadOnSleep: number;
    statesDebounceTime: number;
}

interface Widget {
    data: Record<string, unknown>;
    style: Record<string, unknown>;
    tpl: string;
    widgetSet: string;
}

interface View {
    activeWidgets: string[];
    filterList: string[];
    rerender: boolean;
    settings: Record<string, unknown>;
    widgets: Record<string, Widget>;
}

interface Project {
    // @ts-expect-error this type has bad code-style, we should refactor the views in a views: Record<string, View> attribute
    ___settings: ProjectSettings;
    [view: string]: View;
}
export const updateProject = createAction<Project>('project/update');
export const updateView = createAction<{viewId: string, data: View}>('view/update');
export const updateWidget = createAction<{viewId: string, widgetId: string, data: Widget}>('widget/update');
export const recalculateFields = createAction<boolean>('attributes/recalculate');

const reducer = createReducer(
    {
        visProject: {} as Project,
        recalculateFields: false,
    },
    builder => {
        builder
            .addCase(updateProject, (state, action) => {
                state.visProject = action.payload as Project;
            })
            .addCase(updateView, (state, action) => {
                const { viewId, data } = action.payload;
                state.visProject[viewId] = data;
            })
            .addCase(updateWidget, (state, action) => {
                const { viewId, widgetId, data } = action.payload;
                state.visProject[viewId].widgets[widgetId] = data;
            })
            .addCase(recalculateFields, (state, action) => {
                state.recalculateFields = action.payload;
            });
    },
);

export const store = configureStore({
    reducer,
});
