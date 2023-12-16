import {
    createReducer, configureStore, createAction, createSelector,
} from '@reduxjs/toolkit';
import type { View, Widget, Project } from '@/types';

export const updateProject = createAction<Project>('project/update');
export const updateView = createAction<{viewId: string; data: View}>('view/update');
export const updateWidget = createAction<{viewId: string; widgetId: string; data: Widget}>('widget/update');
export const recalculateFields = createAction<boolean>('attributes/recalculate');

const initialState = {
    visProject: {} as Project,
    recalculateFields: false,
};

const reducer = createReducer(
    initialState,
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

type StoreState = typeof initialState

const selectProject = (state: StoreState) => state.visProject;

export const selectView = createSelector([
    selectProject,
    (_state: StoreState, viewName: string) => viewName,
], (project, view) => project[view]);

export const selectWidget = createSelector([
    selectView,
    (_state: StoreState, _viewName: string, wid: string) => wid,
], (view, wid) => view.widgets[wid]);

export const store = configureStore({
    reducer,
});
