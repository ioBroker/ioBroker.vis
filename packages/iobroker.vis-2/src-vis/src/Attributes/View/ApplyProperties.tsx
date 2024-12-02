import React from 'react';
import { Confirm as ConfirmDialog, I18n } from '@iobroker/adapter-react-v5';

import type { Field, FieldGroup } from '@/Attributes/View/Items';
import type { Project } from '@iobroker/types-vis-2';

export function getViewsWithDifferentValues(
    project: Project,
    field: Field,
    selectedView: string,
    views: string[],
    checkFunction: (
        funcText: boolean | string | ((settings: Record<string, any>) => boolean),
        settings: Record<string, any>,
    ) => boolean,
): string[] | null {
    views = views || Object.keys(project).filter(v => v !== '___settings' && v !== selectedView);
    if (!views.length) {
        return null;
    }

    let value = (project[selectedView].settings as Record<string, any>)?.[field.attr];

    if (field.type === 'checkbox') {
        value = !!value;
    } else if (field.attr === 'navigationOrientation') {
        value = value || 'vertical';
    } else {
        value = value || '';
    }

    const viewsWithDifferentValue: string[] = [];

    for (let v = 0; v < views.length; v++) {
        const view = views[v];

        const isHidden = checkFunction(field.hidden, project[view].settings);
        if (isHidden) {
            continue;
        }

        let val: string | boolean;

        val = (project[view].settings as Record<string, any>)?.[field.attr];
        if (field.type === 'checkbox') {
            val = !!val;
        } else if (field.attr === 'navigationOrientation') {
            val = val || 'vertical';
        } else {
            val = val || '';
        }

        if (val !== value) {
            viewsWithDifferentValue.push(view);
        }
    }

    return viewsWithDifferentValue.length ? viewsWithDifferentValue : null;
}

export interface ApplyField extends Field {
    group: FieldGroup;
}

interface RenderApplyDialogProps {
    project: Project;
    viewList: string[];
    onClose: () => void;
    selectedView: string;
    field: ApplyField | null;
    changeProject: (newProject: Project) => void;
    checkFunction: (
        funcText: boolean | string | ((settings: Record<string, any>) => boolean),
        settings: Record<string, any>,
    ) => boolean;
}

export function renderApplyDialog(props: RenderApplyDialogProps): React.JSX.Element | null {
    if (!props.field) {
        return null;
    }
    const { project, viewList, onClose, selectedView, field, changeProject, checkFunction } = props;

    const viewsToChange: string[] = [];
    // find all fields with applyToAll flag, and if any is not equal show button
    for (let f = 0; f < field.group.fields.length; f++) {
        const cField = field.group.fields[f];

        if (cField.applyToAll) {
            const viewsToChangeForOne: string[] | null =
                getViewsWithDifferentValues(project, cField, selectedView, viewList, checkFunction) || [];
            viewsToChangeForOne?.forEach(_view => {
                if (!viewsToChange.includes(_view)) {
                    viewsToChange.push(_view);
                }
            });
        }
    }

    return (
        <ConfirmDialog
            title={I18n.t('Apply ALL navigation properties to all views')}
            text={`${I18n.t('Following views will be changed')}: ${viewsToChange.join(', ')}`}
            onClose={result => {
                if (result) {
                    const newProject = JSON.parse(JSON.stringify(project));
                    for (let f = 0; f < field.group.fields.length; f++) {
                        const cField = field.group.fields[f];

                        if (cField.applyToAll) {
                            const _viewsToChange: string[] | null =
                                getViewsWithDifferentValues(project, field, selectedView, viewList, checkFunction) ||
                                [];
                            _viewsToChange?.forEach(_view => {
                                newProject[_view].settings[cField.attr] =
                                    newProject[selectedView].settings[cField.attr];
                            });
                        }
                    }

                    changeProject(newProject);
                }
                onClose();
            }}
        />
    );
}
