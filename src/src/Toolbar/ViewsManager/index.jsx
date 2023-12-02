import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@mui/styles';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

import { AppBar, IconButton, Tooltip } from '@mui/material';

import {
    Add as AddIcon,
    CreateNewFolder as CreateNewFolderIcon,
} from '@mui/icons-material';
import { BiImport } from 'react-icons/bi';

import { I18n } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import Folder from './Folder';
import Root from './Root';
import View from './View';
import ExportDialog from './ExportDialog';
import ImportDialog from './ImportDialog';
import FolderDialog from './FolderDialog';
import { DndPreview, isTouchDevice } from '../../Utils';
import { store } from '../../Store';
import {
    deepClone, getNewWidgetId, isGroup, pasteGroup,
} from '../../Utils/utils';

const styles = theme => ({
    viewManageButtonActions: theme.classes.viewManageButtonActions,
    dialog: {
        minWidth: 400,
        minHeight: 300,
    },
    topBar: {
        flexDirection: 'row',
        borderRadius: 4,
        marginBottom: 12,
    },
    folderContainer: {
        clear: 'right',
        '& $viewManageButtonActions': {
            visibility: 'hidden',
        },
        '&:hover $viewManageButtonActions': {
            visibility: 'initial',
        },
    },
    viewContainer: {
        clear: 'right',
        '& $viewManageButtonActions': {
            visibility: 'hidden',
        },
        '&:hover $viewManageButtonActions': {
            visibility: 'initial',
        },
    },
    tooltip: {
        pointerEvents: 'none',
    },
});

const ViewsManager = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const [folderDialog, setFolderDialog] = useState(null);
    const [folderDialogName, setFolderDialogName] = useState('');
    const [folderDialogId, setFolderDialogId] = useState(null);
    const [folderDialogParentId, setFolderDialogParentId] = useState(null);
    const [isDragging, setIsDragging] = useState('');
    const [isOverRoot, setIsOverRoot] = useState(false);

    const [foldersCollapsed, setFoldersCollapsed] = useState([]);
    useEffect(() => {
        if (window.localStorage.getItem('ViewsManager.foldersCollapsed')) {
            setFoldersCollapsed(JSON.parse(window.localStorage.getItem('ViewsManager.foldersCollapsed')));
        }
    }, []);

    const { visProject } = store.getState();

    const moveFolder = (id, parentId) => {
        const project = JSON.parse(JSON.stringify(visProject));
        project.___settings.folders.find(folder => folder.id === id).parentId = parentId;
        props.changeProject(project);
    };

    const moveView = (name, parentId) => {
        const project = JSON.parse(JSON.stringify(visProject));
        project[name].parentId = parentId;
        props.changeProject(project);
    };

    const importViewAction = (view, data) => {
        const project = deepClone(visProject);
        const viewObject = JSON.parse(data);

        if (viewObject.parentId !== undefined) {
            delete viewObject.parentId;
        }

        if (!viewObject || !viewObject.settings || !viewObject.widgets || !viewObject.activeWidgets) {
            return;
        }

        const originalWidgets = deepClone(viewObject.widgets);

        project[view] =  { ...viewObject, widgets: {}, activeWidgets: [] };

        for (const [wid, widget] of Object.entries(originalWidgets)) {
            if (isGroup(widget)) {
                pasteGroup({
                    group: widget, widgets: project[view].widgets, groupMembers: originalWidgets, project,
                });
            } else if (!widget.groupid) {
                const newWid = getNewWidgetId(project);
                project[view].widgets[newWid] = originalWidgets[wid];
            }
        }

        viewObject.name = view;
        props.changeProject(project);
    };

    const renderViews = parentId => Object.keys(visProject)
        .filter(name => !name.startsWith('___'))
        .filter(name => (parentId ? visProject[name].parentId === parentId : !visProject[name].parentId))
        .sort((name1, name2) => (name1.toLowerCase().localeCompare(name2.toLowerCase())))
        .map((name, key) => <div key={key} className={props.classes.viewContainer}>
            <View
                name={name}
                setIsDragging={setIsDragging}
                isDragging={isDragging}
                moveView={moveView}
                setExportDialog={setExportDialog}
                setImportDialog={setImportDialog}
                {...props}
                classes={{}}
            />
        </div>);

    const renderFolders = parentId => {
        const folders = visProject.___settings.folders
            .filter(folder => (parentId ? folder.parentId === parentId : !folder.parentId))
            .sort((folder1, folder2) => folder1.name.toLowerCase().localeCompare(folder2.name.toLowerCase()));

        return folders.map((folder, key) => <div key={key}>
            <div className={props.classes.folderContainer}>
                <Folder
                    setIsDragging={setIsDragging}
                    isDragging={isDragging}
                    folder={folder}
                    setFolderDialog={setFolderDialog}
                    setFolderDialogName={setFolderDialogName}
                    setFolderDialogId={setFolderDialogId}
                    setFolderDialogParentId={setFolderDialogParentId}
                    moveFolder={moveFolder}
                    foldersCollapsed={foldersCollapsed}
                    setFoldersCollapsed={setFoldersCollapsed}
                    {...props}
                    classes={{}}
                />
            </div>
            {foldersCollapsed.includes(folder.id) ? null : <div style={{ paddingLeft: 10 }}>
                {renderFolders(folder.id)}
                {renderViews(folder.id)}
            </div>}
        </div>);
    };

    return <IODialog open={props.open} onClose={props.onClose} title="Manage views" closeTitle="Close">
        <div className={props.classes.dialog}>
            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                <DndPreview />
                {props.editMode ? <AppBar position="static" className={props.classes.topBar}>
                    {props.editMode ? <Tooltip title={I18n.t('Add view')} classes={{ popper: props.classes.tooltip }}>
                        <IconButton
                            size="small"
                            onClick={() => props.showDialog('add', props.name, null, newView => {
                                newView && props.onClose();
                            })}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip> : null}
                    {props.editMode ? <Tooltip title={I18n.t('Import')} classes={{ popper: props.classes.tooltip }}>
                        <IconButton onClick={() => setImportDialog('')} size="small">
                            <BiImport />
                        </IconButton>
                    </Tooltip> : null}
                    {props.editMode ? <Tooltip title={I18n.t('Add folder')} classes={{ popper: props.classes.tooltip }}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setFolderDialog('add');
                                setFolderDialogName('');
                                setFolderDialogParentId(null);
                            }}
                        >
                            <CreateNewFolderIcon />
                        </IconButton>
                    </Tooltip> : null}
                </AppBar> : null}
                <div style={{
                    width: '100%',
                    borderStyle: 'dashed',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: isOverRoot ? 'rgba(200, 200, 200, 1)' : 'rgba(128, 128, 128, 0)',
                    lineHeight: '32px',
                    verticalAlign: 'middle',
                }}
                >
                    {renderFolders()}
                    {renderViews()}
                    <Root
                        isDragging={isDragging}
                        setIsOverRoot={setIsOverRoot}
                        {...props}
                        classes={{}}
                    />
                </div>
            </DndProvider>
        </div>
        <FolderDialog
            dialog={folderDialog}
            dialogFolder={folderDialogId}
            dialogName={folderDialogName}
            dialogParentId={folderDialogParentId}
            setDialog={setFolderDialog}
            setDialogFolder={setFolderDialogId}
            setDialogName={setFolderDialogName}
            {...props}
            classes={{}}
        />
        {importDialog !== false ? <ImportDialog
            open
            onClose={() => setImportDialog(false)}
            view={importDialog || ''}
            importViewAction={importViewAction}
            project={visProject}
            themeName={props.themeName}
        /> : null}
        {exportDialog !== false ? <ExportDialog
            open
            onClose={() => setExportDialog(false)}
            view={exportDialog || ''}
            project={visProject}
            themeName={props.themeName}
        /> : null}
    </IODialog>;
};

ViewsManager.propTypes = {
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    name: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    showDialog: PropTypes.func,
    themeName: PropTypes.string,
    toggleView: PropTypes.func,
    editMode: PropTypes.bool,
};

export default withStyles(styles)(ViewsManager);
