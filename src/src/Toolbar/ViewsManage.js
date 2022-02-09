import I18n from '@iobroker/adapter-react/i18n';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton, withStyles,
} from '@material-ui/core';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { getEmptyImage, HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview';

import { v4 as uuidv4 } from 'uuid';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import FolderIcon from '@material-ui/icons/Folder';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

const styles = () => ({
    buttonActions: {
        float: 'right',
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

const ViewsManage = props => {
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

    const renderViews = parentId => Object.keys(props.project)
        .filter(name => !name.startsWith('___'))
        .filter(name => (parentId ? props.project[name].parentId === parentId : !props.project[name].parentId))
        .map((name, key) => <div key={key} className={props.classes.viewContainer}>
            <IconButton size="small" onClick={() => props.toggleView(name, !props.openedViews.includes(name))}>
                {props.openedViews.includes(name) ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
            <FileIcon />
            <span>{name}</span>
            <span className={props.classes.buttonActions}>
                <IconButton onClick={() => props.showDialog('rename', name)} size="small">
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => props.showDialog('delete', name)} size="small">
                    <DeleteIcon />
                </IconButton>
            </span>
        </div>);

    const renderFolders = parentId => {
        const folders = props.project.___settings.folders
            .filter(folder => (parentId ? folder.parentId === parentId : !folder.parentId));
        return folders.map((folder, key) => <div key={key}>
            <div className={props.classes.folderContainer}>
                <span className={props.classes.buttonActions}>
                    <IconButton size="small" onClick={() => createFolder('folder', folder.id)}>
                        <AddIcon />
                    </IconButton>
                    <IconButton size="small">
                        <EditIcon />
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={() => deleteFolder(folder.id)}
                        disabled={props.project.___settings.folders.find(foundFolder => foundFolder.parentId === folder.id)
                            || Object.values(props.project).find(foundView => foundView.parentId === folder.id)}
                    >
                        <DeleteIcon />
                    </IconButton>

                </span>
                <FolderIcon />
                {folder.name}
                {renderViews(folder.id)}
            </div>
            <div style={{ paddingLeft: 10 }}>
                {renderFolders(folder.id)}
            </div>
        </div>);
    };

    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{I18n.t('Manage views')}</DialogTitle>
        <DialogContent className={props.classes.dialog}>
            <div>
                <IconButton size="small" onClick={() => createFolder('folder')}>
                    <AddIcon />
                </IconButton>
            </div>
            {renderFolders()}
            {renderViews()}
        </DialogContent>
        <DialogActions></DialogActions>
    </Dialog>;
};

export default withStyles(styles)(ViewsManage);
