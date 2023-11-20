import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { withStyles } from '@mui/styles';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import {
    IconButton, Tooltip,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaFolder as FolderClosedIcon, FaFolderOpen as FolderOpenedIcon } from 'react-icons/fa';
import CreateNewFolderClosedIcon from '@mui/icons-material/CreateNewFolder';

import I18n from '@iobroker/adapter-react-v5/i18n';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import { store } from '../../Store';

const styles = theme => ({
    viewManageBlock: theme.classes.viewManageBlock,
    viewManageButtonActions: theme.classes.viewManageButtonActions,
    folderName: {
        marginLeft: theme.spacing(1),
        fontWeight: 'bold',
    },
    icon: {
        cursor: 'grab',
        display: 'inline-block',
        lineHeight: '16px',
        color: theme.palette.mode === 'dark' ? '#bad700' : '#f3bf00',
    },
    noDrop: {
        opacity: 0.4,
    },
    root: {
        borderStyle: 'dashed',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0)',
        lineHeight: '32px',
        verticalAlign: 'middle',
    },
    rootCanDrop: {
        borderColor: 'rgba(200, 200, 200, 1)',
    },
    tooltip: {
        pointerEvents: 'none',
    },
});

const Folder = props => {
    const folderBlock = <div className={props.classes.viewManageBlock}>
        {props.foldersCollapsed.includes(props.folder.id)
            ? <FolderClosedIcon fontSize={20} />
            : <FolderOpenedIcon fontSize={20} />}
        <span className={props.classes.folderName}>{props.folder.name}</span>
    </div>;

    const [{ canDrop }, drop] = useDrop(() => ({
        accept: ['view', 'folder'],
        drop: () => ({ folder: props.folder }),
        canDrop: (item, monitor) => {
            if (monitor.getItemType() === 'view') {
                return store.getState().visProject[item.name].parentId !== props.folder.id;
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
                    currentFolder = store.getState().visProject.___settings.folders.find(foundFolder => foundFolder.id === currentFolder.parentId);
                }
            }
            return false;
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [store.getState().visProject]);

    const [{ isDraggingThisItem }, dragRef, preview] = useDrag({
        type: 'folder',
        item: () => ({
            folder: props.folder,
            preview: <div>{folderBlock}</div>,
        }),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                props.moveFolder(item.folder.id, dropResult.folder.id);
            }
        },
        collect: monitor => ({
            isDraggingThisItem: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    }, [store.getState().visProject]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [store.getState().visProject]);

    useEffect(() => {
        props.setIsDragging(isDraggingThisItem ? props.folder.id : '');
    }, [isDraggingThisItem]);

    console.log(`${props.folder.name} ${props.isDragging} ${canDrop}`);

    return <div
        ref={drop}
        className={Utils.clsx(props.classes.root, props.classes.viewManageBlock, props.isDragging && !canDrop && props.classes.noDrop, props.isDragging && canDrop && props.classes.rootCanDrop)}
    >
        <div className={props.classes.icon} ref={dragRef} title={I18n.t('Drag me')}>
            {props.foldersCollapsed.includes(props.folder.id)
                ? <FolderClosedIcon
                    fontSize={20}
                    onClick={() => {
                        const foldersCollapsed = JSON.parse(JSON.stringify(props.foldersCollapsed));
                        foldersCollapsed.splice(foldersCollapsed.indexOf(props.folder.id), 1);
                        props.setFoldersCollapsed(foldersCollapsed);
                        window.localStorage.setItem('ViewsManager.foldersCollapsed', JSON.stringify(foldersCollapsed));
                    }}
                />
                : <FolderOpenedIcon
                    fontSize={20}
                    onClick={() => {
                        const foldersCollapsed = JSON.parse(JSON.stringify(props.foldersCollapsed));
                        foldersCollapsed.push(props.folder.id);
                        props.setFoldersCollapsed(foldersCollapsed);
                        window.localStorage.setItem('ViewsManager.foldersCollapsed', JSON.stringify(foldersCollapsed));
                    }}
                />}
        </div>
        <span className={props.classes.folderName}>{props.folder.name}</span>
        <span className={props.classes.viewManageButtonActions}>
            {props.editMode ? <Tooltip title={I18n.t('Add view')} classes={{ popper: props.classes.tooltip }}>
                <IconButton
                    size="small"
                    onClick={() => {
                        props.showDialog('add', null, props.folder.id);
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Tooltip> : null}
            {props.editMode ? <Tooltip title={I18n.t('Add sub-folder')} classes={{ popper: props.classes.tooltip }}>
                <IconButton
                    size="small"
                    onClick={() => {
                        props.setFolderDialog('add');
                        props.setFolderDialogName('');
                        props.setFolderDialogParentId(props.folder.id);
                    }}
                >
                    <CreateNewFolderClosedIcon />
                </IconButton>
            </Tooltip> : null}
            {props.editMode ? <Tooltip title={I18n.t('Rename')} classes={{ popper: props.classes.tooltip }}>
                <IconButton
                    size="small"
                    onClick={() => {
                        props.setFolderDialog('rename');
                        props.setFolderDialogName(props.folder.name);
                        props.setFolderDialogId(props.folder.id);
                    }}
                >
                    <EditIcon />
                </IconButton>
            </Tooltip> : null}
            {props.editMode ? <Tooltip title={I18n.t('Delete')} classes={{ popper: props.classes.tooltip }}>
                <span>
                    <IconButton
                        size="small"
                        onClick={() => {
                            props.setFolderDialog('delete');
                            props.setFolderDialogId(props.folder.id);
                        }}
                        disabled={!!(store.getState().visProject.___settings.folders.find(foundFolder => foundFolder.parentId === props.folder.id)
                            || Object.values(store.getState().visProject).find(foundView => foundView.parentId === props.folder.id))}
                    >
                        <DeleteIcon />
                    </IconButton>
                </span>
            </Tooltip> : null}
        </span>
    </div>;
};

Folder.propTypes = {
    classes: PropTypes.object,
    folder: PropTypes.object,
    moveFolder: PropTypes.func,
    setFolderDialog: PropTypes.func,
    setFolderDialogId: PropTypes.func,
    setFolderDialogName: PropTypes.func,
    setFolderDialogParentId: PropTypes.func,
    setIsDragging: PropTypes.func,
    isDragging: PropTypes.string,
    editMode: PropTypes.bool,
};

export default withStyles(styles)(Folder);
