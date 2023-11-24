import { createReducer, configureStore, createAction } from '@reduxjs/toolkit';
import type { View, Widget, Project } from '@/types';

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
