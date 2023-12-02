import React from 'react';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FileCopy as FileCopyIcon,
} from '@mui/icons-material';

import {
    TextField,
} from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

import { store } from '@/Store';
import {
    deepClone, getNewWidgetId, isGroup, pasteGroup,
} from '@/Utils/utils';
import { useFocus } from '@/Utils';
import IODialog from '@/Components/IODialog';
import { Project } from '@/types';

interface ViewDialogProps {
    changeProject: (project: Project) => Promise<void>,
    changeView: (viewName: string) => Promise<void>,
    dialog: string,
    /** Name of view */
    dialogName: string,
    dialogView: string;
    dialogCallback?: { cb: (dialogName: string) => void };
    selectedView: string;
    setDialog: (closeAction: null) => void;
    setDialogName: (dialogName: string) => void,
    setDialogView: (action: null) => void,
    dialogParentId?: string,
    noTranslation: boolean;
    setDialogParentId: (action: null) => void;
}

const ViewDialog = (props: ViewDialogProps) => {
    const inputField = useFocus(!!props.dialog && props.dialog !== 'delete', props.dialog === 'add');

    const deleteView = async () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        delete project[view];
        await props.changeView(Object.keys(project).filter(foundView => !foundView.startsWith('__'))[0]);
        await props.changeProject(project);
        props.setDialog(null); // close dialog
    };

    const addView = async () => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project[props.dialogName] = {
            name: props.dialogName,
            parentId: props.dialogParentId,
            settings: {
                style: {},
            },
            widgets: {},
            activeWidgets: {},
        };
        await props.changeProject(project);
        await props.changeView(props.dialogName);
        props.setDialog(null); // close dialog
        props.dialogCallback?.cb(props.dialogName);
    };

    const renameView = async () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project[props.dialogName] = project[view];
        delete project[view];
        await props.changeProject(project);
        await props.changeView(props.dialogName);
        props.setDialog(null);
        props.dialogCallback?.cb(props.dialogName);
    };

    const copyView = async () => {
        const view = props.dialogView || props.selectedView;
        const project = deepClone(store.getState().visProject);
        project[props.dialogName] = { ...project[view], widgets: {}, activeWidgets: [] };
        const originalWidgets = deepClone(project[view].widgets);

        for (const [wid, widget] of Object.entries(originalWidgets)) {
            if (isGroup(widget)) {
                pasteGroup({
                    group: widget, widgets: project[props.dialogName].widgets, groupMembers: originalWidgets, project,
                });
            } else if (!widget.groupid) {
                const newWid = getNewWidgetId(project);
                project[props.dialogName].widgets[newWid] = originalWidgets[wid];
            }
        }

        await props.changeProject(project);
        await props.changeView(props.dialogName);
        props.setDialog(null);
        props.dialogCallback?.cb(props.dialogName);
    };

    const dialogTitles: Record<string, string> = {
        delete: I18n.t('Do you want to delete view "%s"?', props.dialogView || props.selectedView),
        copy: I18n.t('Copy view "%s"', props.dialogView || props.selectedView),
        rename: I18n.t('Rename view "%s"', props.dialogView || props.selectedView),
        add: I18n.t('Add view'),
    };

    const dialogButtons: Record<string, string> = {
        delete: I18n.t('Delete'),
        copy: I18n.t('Create copy'),
        rename: I18n.t('Rename'),
        add: I18n.t('Add'),
    };

    const dialogActions: Record<string, () => Promise<void>> = {
        delete: deleteView,
        copy: copyView,
        rename: renameView,
        add: addView,
    };

    const dialogInputs: Record<string, string> = {
        copy: I18n.t('Name of copy'),
        rename: I18n.t('New name'),
        add: I18n.t('Name'),
    };

    const dialogIcons: Record<string, unknown> = {
        delete: DeleteIcon,
        copy: FileCopyIcon,
        rename: EditIcon,
        add: AddIcon,
    };

    const DialogIcon = dialogIcons[props.dialog];

    let dialogDisabled = false;
    if (props.dialog !== 'delete') {
        if (store.getState().visProject[props.dialogName]) {
            dialogDisabled = true;
        }
    }

    if (!props.dialog) {
        return null;
    }

    return <IODialog
        title={dialogTitles[props.dialog]}
        noTranslation={props.noTranslation}
        actionTitle={dialogButtons[props.dialog]}
        open={!!props.dialog}
        onClose={() => {
            props.setDialog(null);
            props.setDialogView(null);
            props.setDialogParentId(null);
        }}
        ActionIcon={DialogIcon || null}
        action={dialogActions[props.dialog]}
        actionColor={props.dialog === 'delete' ? 'secondary' : 'primary'}
        actionDisabled={dialogDisabled}
    >
        {props.dialog === 'delete' ? null
            : <TextField
                inputRef={inputField}
                variant="standard"
                label={dialogInputs[props.dialog]}
                fullWidth
                value={props.dialogName}
                onChange={e => props.setDialogName(e.target.value)}
            /> }
    </IODialog>;
};

export default ViewDialog;
