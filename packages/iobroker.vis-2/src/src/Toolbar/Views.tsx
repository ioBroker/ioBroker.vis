import React, { useState } from 'react';

import {
    Tooltip,
} from '@mui/material';

import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';

import type { ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import { I18n } from '@iobroker/adapter-react-v5';

import type { EditorClass } from '@/Editor';
import type { VisTheme } from '@iobroker/types-vis-2';
import commonStyles from '@/Utils/styles';
import ViewsManager from './ViewsManager';

import type { ToolbarItem } from './ToolbarItems';
import ToolbarItems from './ToolbarItems';
import ViewDialog from './ViewsManager/ViewDialog';

const styles: Record<string, React.CSSProperties> = {
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
    setViewsManager: EditorClass['setViewsManager'];
    viewsManager: boolean;
    selectedGroup: string;
    editMode: boolean;
    setProjectsDialog: EditorClass['setProjectsDialog'];
    changeProject: EditorClass['changeProject'];
    theme: VisTheme;
    changeView: EditorClass['changeView'];
    setSelectedWidgets: EditorClass['setSelectedWidgets'];
    themeType: ThemeType;
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    themeName: ThemeName;
    toggleView: EditorClass['toggleView'];
}

const Views = (props: ViewsProps) => {
    const [dialog, setDialog] = useState(null);
    // eslint-disable-next-line no-spaced-func, func-call-spacing
    const [dialogCallback, setDialogCallback] = useState<{ cb: (dialogName: string) => void }>(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogView, setDialogView] = useState(null);
    const [dialogParentId, setDialogParentId] = useState(null);

    const showDialog = (
        type: 'add' | 'rename' | 'delete' | 'copy',
        view?: string,
        parentId?: string,
        // eslint-disable-next-line no-shadow
        cb?: (dialogName: string) => void,
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

    const toolbar: {
        name: React.JSX.Element;
        items: (ToolbarItem | ToolbarItem[] | ToolbarItem[][])[];
    } = {
        name: <span style={styles.label}>
            <Tooltip title={I18n.t('Current project')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
                <span
                    style={styles.projectLabel}
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
        <ToolbarItems
            group={toolbar}
            theme={props.theme}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            setSelectedWidgets={props.setSelectedWidgets}
            themeType={props.themeType}
            toolbarHeight={props.toolbarHeight}
        />
        <ViewsManager
            open={props.viewsManager}
            onClose={() => props.setViewsManager(false)}
            showDialog={showDialog}
            theme={props.theme}
            changeProject={props.changeProject}
            editMode={props.editMode}
            selectedView={props.selectedView}
            themeName={props.themeName}
            themeType={props.themeType}
            toggleView={props.toggleView}
        />
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

export default Views;
