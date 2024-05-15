import React, { useState } from 'react';
import { withStyles } from '@mui/styles';

import {
    Tooltip,
} from '@mui/material';

import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import ViewsManager from './ViewsManager';
import ToolbarItems from './ToolbarItems';

import ViewDialog from './ViewsManager/ViewDialog';

const styles: Record<string, any> = {
    label: {
        maxWidth: 180,
        textOverflow: 'ellipsis',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    projectLabel: {
        cursor: 'pointer',
        fontWeight: 'bold',
    },
};

interface ViewsProps {
    projectName: string;
    selectedView: string;
    setViewsManager: (open: boolean) => void;
    viewsManager: boolean;
    selectedGroup: string;
    editMode: boolean;
    setProjectsDialog: (open: boolean) => void;
    classes: Record<string, string>;
    changeProject: (project: Record<string, any>) => Promise<void>;
    changeView: (viewName: string) => Promise<void>;
}

const Views = (props: ViewsProps) => {
    const [dialog, setDialog] = useState(null);
    const [dialogCallback, setDialogCallback] = useState(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogView, setDialogView] = useState(null);
    const [dialogParentId, setDialogParentId] = useState(null);

    const showDialog = (
        type: 'add' | 'rename' | 'delete' | 'copy',
        view?: string,
        parentId?: string,
        cb?: () => void,
    ) => {
        view = view || props.selectedView;

        const dialogDefaultName: Record<string, string> = {
            add: I18n.t('New view'),
            rename: view,
            copy: `${view} ${I18n.t('Copy noun')}`,
        };

        setDialog(type);
        setDialogView(view);
        setDialogParentId(parentId);
        setDialogName(dialogDefaultName[type]);
        setDialogCallback(cb ? { cb } : null);
    };

    const toolbar = {
        name: <span className={props.classes.label}>
            <Tooltip title={I18n.t('Current project')}>
                <span
                    className={props.classes.projectLabel}
                    onClick={() => props.setProjectsDialog(true)}
                >
                    {props.projectName}
                </span>
            </Tooltip>
        </span>,
        items: [
            {
                type: 'icon-button', Icon: AddIcon, name: 'Add new view', onClick: () => showDialog('add'), disabled: !!props.selectedGroup || !props.editMode,
            },
            [
                [
                    {
                        type: 'icon-button', Icon: EditIcon, name: 'Rename view', onClick: () => showDialog('rename'), disabled: !!props.selectedGroup || !props.editMode,
                    },
                ],
                [
                    {
                        type: 'icon-button', Icon: DeleteIcon, name: 'Delete actual view', onClick: () => showDialog('delete'), disabled: !!props.selectedGroup || !props.editMode,
                    },
                ],
            ],
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage views', onClick: () => props.setViewsManager(true), disabled: !!props.selectedGroup,
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} {...props} classes={{}} />
        <ViewsManager open={props.viewsManager} onClose={() => props.setViewsManager(false)} showDialog={showDialog} {...props} classes={{}} />
        <ViewDialog
            dialog={dialog}
            dialogView={dialogView}
            dialogName={dialogName}
            dialogCallback={dialogCallback}
            noTranslation
            dialogParentId={dialogParentId}
            setDialog={setDialog}
            setDialogView={setDialogView}
            setDialogName={setDialogName}
            setDialogParentId={setDialogParentId}
            changeProject={props.changeProject}
            changeView={props.changeView}
            selectedView={props.selectedView}
        />
    </>;
};

export default withStyles(styles)(Views);
