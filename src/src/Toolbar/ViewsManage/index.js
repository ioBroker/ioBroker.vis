import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import { AppBar, IconButton, Tooltip } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { BiImport } from 'react-icons/bi';

import IODialog from '../../Components/IODialog';
import Folder from './Folder';
import View from './View';
import ExportDialog from './ExportDialog';
import ImportDialog from './ImportDialog';
import FolderDialog from './FolderDialog';
import { DndPreview, isTouchDevice } from '../../Utils';

const styles = theme => ({
    viewManageButtonActions: theme.classes.viewManageButtonActions,
    dialog: {
        minWidth: 400,
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
});

const ViewsManage = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const [folderDialog, setFolderDialog] = useState(null);
    const [folderDialogName, setFolderDialogName] = useState('');
    const [folderDialogId, setFolderDialogId] = useState(null);
    const [folderDialogParentId, setFolderDialogParentId] = useState(null);

    const [foldersCollapsed, setFoldersCollapsed] = useState([]);
    useEffect(() => {
        if (window.localStorage.getItem('ViewsManage.foldersCollapsed')) {
            setFoldersCollapsed(JSON.parse(window.localStorage.getItem('ViewsManage.foldersCollapsed')));
        }
    }, []);

    const moveFolder = (id, parentId) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.find(folder => folder.id === id).parentId = parentId;
        props.changeProject(project);
    };

    const moveView = (name, parentId) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project[name].parentId = parentId;
        props.changeProject(project);
    };

    const importViewAction = (view, data) => {
        const project = JSON.parse(JSON.stringify(props.project));
        const viewObject = JSON.parse(data);
        if (!viewObject || !viewObject.settings || !viewObject.widgets || !viewObject.activeWidgets) {
            return;
        }
        viewObject.name = view;
        project[view] = viewObject;
        props.changeProject(project);
    };

    const renderViews = parentId => Object.keys(props.project)
        .filter(name => !name.startsWith('___'))
        .filter(name => (parentId ? props.project[name].parentId === parentId : !props.project[name].parentId))
        .map((name, key) => <div key={key} className={props.classes.viewContainer}>
            <View
                name={name}
                moveView={moveView}
                setExportDialog={setExportDialog}
                setImportDialog={setImportDialog}
                {...props}
                classes={{}}
            />
        </div>);

    const renderFolders = parentId => {
        const folders = props.project.___settings.folders
            .filter(folder => (parentId ? folder.parentId === parentId : !folder.parentId));
        return folders.map((folder, key) => <div key={key}>
            <div className={props.classes.folderContainer}>
                <Folder
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
                <AppBar position="static" className={props.classes.topBar}>
                    <Tooltip title={I18n.t('Add view')}>
                        <IconButton size="small" onClick={() => props.showDialog('add', props.name)}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Import')}>
                        <IconButton onClick={() => setImportDialog('')} size="small">
                            <BiImport />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Add folder')}>
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
                    </Tooltip>
                </AppBar>
                <Folder
                    folder={{ name: I18n.t('root'), id: null }}
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
                {foldersCollapsed.includes(null) ? null
                    : <div style={{ paddingLeft: 10 }}>
                        {renderFolders()}
                        {renderViews()}
                    </div>}
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
        <ImportDialog
            open={importDialog !== false}
            onClose={() => setImportDialog(false)}
            view={importDialog || ''}
            importViewAction={importViewAction}
            project={props.project}
            themeName={props.themeName}
        />
        <ExportDialog
            open={exportDialog !== false}
            onClose={() => setExportDialog(false)}
            view={exportDialog || ''}
            project={props.project}
            themeName={props.themeName}
        />
    </IODialog>;
};

ViewsManage.propTypes = {
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    name: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    showDialog: PropTypes.func,
    themeName: PropTypes.string,
};

export default withStyles(styles)(ViewsManage);
