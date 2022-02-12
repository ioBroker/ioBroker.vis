import I18n from '@iobroker/adapter-react/i18n';
import {
    IconButton, Tooltip, withStyles,
} from '@material-ui/core';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview';

import { v4 as uuidv4 } from 'uuid';

import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import AddIcon from '@material-ui/icons/Add';
import { useState } from 'react';
import { BiImport } from 'react-icons/bi';
import IODialog from '../../Components/IODialog';
import Folder from './Folder';
import View from './View';
import ExportDialog from './ExportDialog';
import ImportDialog from './ImportDialog';

const styles = () => ({
    viewManageBlock: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'grab',
    },
    buttonActions: {
        textAlign: 'right',
        flex: 1,
    },
    dialog: {
        width: 400,
    },
    folderContainer: {
        clear: 'right',
        '& $buttonActions': {
            visibility: 'hidden',
        },
        '&:hover $buttonActions': {
            visibility: 'initial',
        },
    },
    viewContainer: {
        clear: 'right',
        '& $buttonActions': {
            visibility: 'hidden',
        },
        '&:hover $buttonActions': {
            visibility: 'initial',
        },
    },
});

const DndPreview = () => {
    const { display/* , itemType */, item, style } = usePreview();
    if (!display) {
        return null;
    }
    return <div style={style}>{item.preview}</div>;
};

function isTouchDevice() {
    return (('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
}

const ViewsManage = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const createFolder = (name, parentId) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.push({
            id: uuidv4(),
            name,
            parentId,
        });
        props.changeProject(project);
    };

    const deleteFolder = id => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.splice(project.___settings.folders.findIndex(folder => folder.id === id), 1);
        props.changeProject(project);
    };

    const renameFolder = (id, name) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.find(folder => folder.id === id).name = name;
        props.changeProject(project);
    };

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
            />
        </div>);

    const renderFolders = parentId => {
        const folders = props.project.___settings.folders
            .filter(folder => (parentId ? folder.parentId === parentId : !folder.parentId));
        return folders.map((folder, key) => <div key={key}>
            <div className={props.classes.folderContainer}>
                <Folder
                    folder={folder}
                    createFolder={createFolder}
                    deleteFolder={deleteFolder}
                    moveFolder={moveFolder}
                    {...props}
                />
            </div>
            <div style={{ paddingLeft: 10 }}>
                {renderFolders(folder.id)}
                {renderViews(folder.id)}
            </div>
        </div>);
    };

    return <IODialog open={props.open} onClose={props.onClose} title="Manage views" closeTitle="Close">
        <div className={props.classes.dialog}>
            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                <DndPreview />
                <div>
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
                        <IconButton size="small" onClick={() => createFolder('folder')}>
                            <CreateNewFolderIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <Folder
                    folder={{ name: I18n.t('root') }}
                    createFolder={createFolder}
                    deleteFolder={deleteFolder}
                    moveFolder={moveFolder}
                    {...props}
                />
                <div style={{ paddingLeft: 10 }}>
                    {renderFolders()}
                    {renderViews()}
                </div>
            </DndProvider>
        </div>
        <ImportDialog
            open={importDialog !== false}
            onClose={() => setImportDialog(false)}
            view={importDialog}
            importViewAction={importViewAction}
            project={props.project}
            themeName={props.themeName}
        />
        <ExportDialog
            open={exportDialog !== false}
            onClose={() => setExportDialog(false)}
            view={exportDialog}
            project={props.project}
            themeName={props.themeName}
        />
    </IODialog>;
};

export default withStyles(styles)(ViewsManage);
