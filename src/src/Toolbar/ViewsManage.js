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
import { useEffect, useRef } from 'react';

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

const View = props => {
    const viewBlock = <>
        <IconButton size="small" onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}>
            {props.openedViews.includes(props.name) ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </IconButton>
        <FileIcon />
        <span>{props.name}</span>
        <span className={props.classes.buttonActions}>
            <IconButton onClick={() => props.showDialog('rename', props.name)} size="small">
                <EditIcon />
            </IconButton>
            <IconButton onClick={() => props.showDialog('delete', props.name)} size="small">
                <DeleteIcon />
            </IconButton>
        </span>
    </>;

    const widthRef = useRef();
    const [{ isDragging }, dragRef, preview] = useDrag(
        {
            type: 'view',
            item: () => ({
                name: props.name,
                preview: <div style={{ width: widthRef.current.offsetWidth }}>
                    {viewBlock}
                </div>,
            }),
            end: (item, monitor) => {
                const dropResult = monitor.getDropResult();
                if (item && dropResult) {
                    props.moveView(item.name, dropResult.folder.id);
                }
            },
            collect: monitor => ({
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId(),
            }),
        }, [props.project],
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.project]);

    return <div ref={dragRef}>
        <div ref={widthRef}>
            {viewBlock}
        </div>
    </div>;
};

const Folder = props => {
    const folderBlock = <>
        {props.folder.id ? <span className={props.classes.buttonActions}>
            <IconButton size="small" onClick={() => props.createFolder('folder', props.folder.id)}>
                <AddIcon />
            </IconButton>
            <IconButton size="small">
                <EditIcon />
            </IconButton>
            <IconButton
                size="small"
                onClick={() => props.deleteFolder(props.folder.id)}
                disabled={!!(props.project.___settings.folders.find(foundFolder => foundFolder.parentId === props.folder.id)
                || Object.values(props.project).find(foundView => foundView.parentId === props.folder.id))}
            >
                <DeleteIcon />
            </IconButton>
        </span> : null}
        <FolderIcon />
        {props.folder.name}
    </>;

    const [{ CanDrop, isOver, isCanDrop }, drop] = useDrop(() => ({
        accept: ['view', 'folder'],
        drop: () => ({ folder: props.folder }),
        canDrop: (item, monitor) => {
            if (monitor.getItemType() === 'view') {
                return props.project[item.name].parentId !== props.folder.id;
            }
            if (monitor.getItemType() === 'folder') {
                let currentFolder = props.folder;
                if (currentFolder.id === item.folder.parentId) {
                    return false;
                }
                while (true) {
                    if (currentFolder.id === item.folder.id) {
                        return false;
                    }
                    if (!currentFolder.parentId) {
                        return true;
                    }
                    currentFolder = props.project.___settings.folders.find(foundFolder => foundFolder.id === currentFolder.parentId);
                }
            }
            return false;
        },
        collect: (monitor, item) => ({
            isOver: monitor.isOver(),
            CanDrop: monitor.canDrop(),
        }),
    }), [props.project]);

    const widthRef = useRef();
    const [{ isDragging }, dragRef, preview] = useDrag(
        {
            type: 'folder',
            item: () => ({
                folder: props.folder,
                preview: <div style={{ width: widthRef.current.offsetWidth }}>
                    {folderBlock}
                </div>,
            }),
            end: (item, monitor) => {
                const dropResult = monitor.getDropResult();
                if (item && dropResult) {
                    props.moveFolder(item.folder.id, dropResult.folder.id);
                }
            },
            collect: monitor => ({
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId(),
            }),
        }, [props.project],
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.project]);

    return <div ref={drop}>
        <div ref={dragRef}>
            <div ref={widthRef}>
                {folderBlock}
            </div>
        </div>
    </div>;
};

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

    const moveView = (name, parentId) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project[name].parentId = parentId;
        props.changeProject(project);
    };

    const renderViews = parentId => Object.keys(props.project)
        .filter(name => !name.startsWith('___'))
        .filter(name => (parentId ? props.project[name].parentId === parentId : !props.project[name].parentId))
        .map((name, key) => <div key={key} className={props.classes.viewContainer}>
            <View
                name={name}
                moveView={moveView}
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

    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{I18n.t('Manage views')}</DialogTitle>
        <DialogContent className={props.classes.dialog}>
            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                <DndPreview />
                <div>
                    <IconButton size="small" onClick={() => createFolder('folder')}>
                        <AddIcon />
                    </IconButton>
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
        </DialogContent>
        <DialogActions></DialogActions>
    </Dialog>;
};

export default withStyles(styles)(ViewsManage);
