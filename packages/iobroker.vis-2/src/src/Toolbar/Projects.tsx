import React, { useState } from 'react';
import { withStyles } from '@mui/styles';

import {
    Menu as MenuIcon,
    Settings as SettingsIcon,
    List as ListIcon,
    FileCopy as FilesIcon,
} from '@mui/icons-material';

import {
    SelectID,
    I18n,
    SelectFile as SelectFileDialog,
    Utils,
} from '@iobroker/adapter-react-v5';
import type { Connection, ThemeType, type LegacyConnection } from '@iobroker/adapter-react-v5';

import type { EditorClass } from '@/Editor';
import type { ToolbarItem } from './ToolbarItems';
import ToolbarItems from './ToolbarItems';
import Settings from './Settings';
import ProjectsManager from './ProjectsManager';

const styles = () => ({
    objectsDialog: {
        minWidth: 800,
        height: '100%',
        overflow: 'hidden',
    },
});

interface ToolsProps {
    socket: LegacyConnection;
    projectsDialog: boolean;
    setProjectsDialog: EditorClass['setProjectsDialog'];
    adapterName: string;
    instance: number;
    projectName: string;
    changeProject: EditorClass['changeProject'];
    selectedView: string;
    setSelectedWidgets: EditorClass['setSelectedWidgets'];
    themeType: ThemeType;
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    addProject: EditorClass['addProject'];
    deleteProject: EditorClass['deleteProject'];
    loadProject: EditorClass['loadProject'];
    projects: string[];
    refreshProjects: EditorClass['refreshProjects'];
    renameProject: EditorClass['renameProject'];
}

const Tools = (props: ToolsProps) => {
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [objectsDialog, setObjectsDialog] = useState(false);
    const [filesDialog, setFilesDialog] = useState(false);

    const toolbar: {
        name: string;
        items: (ToolbarItem | ToolbarItem[] | ToolbarItem[][])[];
    } = {
        name: 'Projects',
        items: [
            {
                type: 'icon-button', Icon: SettingsIcon, name: 'Settings', onClick: () => setSettingsDialog(true),
            },
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage projects', onClick: () => props.setProjectsDialog(true),
            },
            {
                type: 'icon-button', Icon: ListIcon, name: 'Objects', onClick: () => setObjectsDialog(true),
            },
            {
                type: 'icon-button', Icon: FilesIcon, name: 'Files', onClick: () => setFilesDialog(true),
            },
        ],
    };

    return <>
        <ToolbarItems
            group={toolbar}
            last
            classes={{}}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            setSelectedWidgets={props.setSelectedWidgets}
            themeType={props.themeType}
            toolbarHeight={props.toolbarHeight}
        />
        {settingsDialog ? <Settings
            onClose={() => setSettingsDialog(false)}
            {...props}
            classes={{}}
            adapterName={props.adapterName}
            instance={props.instance}
            projectName={props.projectName}
        /> : null}
        {props.projectsDialog ? <ProjectsManager
            open={!0}
            onClose={() => props.setProjectsDialog(false)}
            classes={{}}
            adapterName={props.adapterName}
            instance={props.instance}
            addProject={props.addProject}
            changeProject={props.changeProject}
            deleteProject={props.deleteProject}
            loadProject={props.loadProject}
            projectName={props.projectName}
            projects={props.projects}
            refreshProjects={props.refreshProjects}
            renameProject={props.renameProject}
            selectedView={props.selectedView}
            socket={props.socket}
            themeType={props.themeType}
        /> : null}
        {
            objectsDialog ? <SelectID
                imagePrefix="../"
                onClose={() => setObjectsDialog(false)}
                socket={props.socket as any as Connection}
                title={I18n.t('Browse objects')}
                columns={['role', 'func', 'val', 'name']}
                notEditable={false}
                onOk={_selected => {
                    const selected: string = Array.isArray(_selected) ? _selected[0] : _selected as string;
                    Utils.copyToClipboard(selected);
                    setObjectsDialog(false);
                    window.alert(I18n.t('Copied'));
                }}
                ok={I18n.t('Copy to clipboard')}
                cancel={I18n.t('ra_Close')}
            /> : null
        }
        {
            filesDialog ? <SelectFileDialog
                title={I18n.t('Browse files')}
                onClose={() => setFilesDialog(false)}
                restrictToFolder={`${props.adapterName}.${props.instance}/${props.projectName}`}
                allowNonRestricted
                allowUpload
                allowDownload
                allowCreateFolder
                allowDelete
                allowView
                showToolbar
                imagePrefix="../"
                selected=""
                showTypeSelector
                onOk={_selected => {
                    let selected: string = Array.isArray(_selected) ? _selected[0] : _selected as string;

                    const projectPrefix = `${props.adapterName}.${props.instance}/${props.projectName}/`;
                    if (selected.startsWith(projectPrefix)) {
                        selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                    } else if (selected.startsWith('/')) {
                        selected = `..${selected}`;
                    } else if (!selected.startsWith('.')) {
                        selected = `../${selected}`;
                    }
                    Utils.copyToClipboard(selected);
                    setFilesDialog(false);
                    window.alert(I18n.t('ra_Copied %s', selected));
                }}
                socket={props.socket as any as Connection}
                ok={I18n.t('Copy to clipboard')}
                cancel={I18n.t('ra_Close')}
            /> : null
        }
    </>;
};

export default withStyles(styles)(Tools) as React.FC<ToolsProps>;
