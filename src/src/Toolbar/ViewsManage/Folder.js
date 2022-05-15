import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    IconButton, Tooltip,
} from '@mui/material';

import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaFolder as FolderClosedIcon, FaFolderOpen as FolderOpenedIcon } from 'react-icons/fa';

import CreateNewFolderClosedIcon from '@mui/icons-material/CreateNewFolder';
import { useEffect, useRef } from 'react';
import { withStyles } from '@mui/styles';

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
    },
});

const Folder = props => {
    const folderBlock = <div className={props.classes.viewManageBlock}>
        {props.foldersCollapsed.includes(props.folder.id)
            ? <FolderClosedIcon fontSize={20} />
            : <FolderOpenedIcon fontSize={20} />}
        <span className={props.classes.folderName}>{props.folder.name}</span>
    </div>;

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
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
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [props.project]);

    const widthRef = useRef();
    const [{ isDragging, opacity }, dragRef, preview] = useDrag(
        {
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
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId(),
                opacity: monitor.isDragging() ? 0.4 : 1,
            }),
        }, [props.project],
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [props.project]);

    useEffect(() => {
        props.setIsDragging(isDragging);
    }, [isDragging]);

    return <div
        ref={drop}
        style={{
            borderStyle: 'dashed',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: isOver && canDrop ? 'rgba(200, 200, 200, 1)' : 'rgba(128, 128, 128, 0)',
            lineHeight: '32px',
            verticalAlign: 'middle',
        }}
    >
        <div>
            <div ref={widthRef} style={{ opacity }}>
                <div className={props.classes.viewManageBlock}>
                    <Tooltip title={I18n.t('Drag me')}>
                        <div className={props.classes.icon} ref={dragRef}>
                            {props.foldersCollapsed.includes(props.folder.id)
                                ? <FolderClosedIcon
                                    fontSize={20}
                                    onClick={() => {
                                        const foldersCollapsed = JSON.parse(JSON.stringify(props.foldersCollapsed));
                                        foldersCollapsed.splice(foldersCollapsed.indexOf(props.folder.id), 1);
                                        props.setFoldersCollapsed(foldersCollapsed);
                                        window.localStorage.setItem('ViewsManage.foldersCollapsed', JSON.stringify(foldersCollapsed));
                                    }}
                                />
                                : <FolderOpenedIcon
                                    fontSize={20}
                                    onClick={() => {
                                        const foldersCollapsed = JSON.parse(JSON.stringify(props.foldersCollapsed));
                                        foldersCollapsed.push(props.folder.id);
                                        props.setFoldersCollapsed(foldersCollapsed);
                                        window.localStorage.setItem('ViewsManage.foldersCollapsed', JSON.stringify(foldersCollapsed));
                                    }}
                                />}
                        </div>
                    </Tooltip>
                    <span className={props.classes.folderName}>{props.folder.name}</span>
                    <span className={props.classes.viewManageButtonActions}>
                        <Tooltip title={I18n.t('Add view')}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    props.showDialog('add', null, props.folder.id);
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={I18n.t('Add sub-folder')}>
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
                        </Tooltip>
                        <Tooltip title={I18n.t('Rename')}>
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
                        </Tooltip>
                        <Tooltip title={I18n.t('Delete')}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    props.setFolderDialog('delete');
                                    props.setFolderDialogId(props.folder.id);
                                }}
                                disabled={!!(props.project.___settings.folders.find(foundFolder => foundFolder.parentId === props.folder.id)
                                    || Object.values(props.project).find(foundView => foundView.parentId === props.folder.id))}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>
            </div>
        </div>
    </div>;
};

Folder.propTypes = {
    classes: PropTypes.object,
    folder: PropTypes.object,
    moveFolder: PropTypes.func,
    project: PropTypes.object,
    setFolderDialog: PropTypes.func,
    setFolderDialogId: PropTypes.func,
    setFolderDialogName: PropTypes.func,
    setFolderDialogParentId: PropTypes.func,
    setIsDragging: PropTypes.func,
};

export default withStyles(styles)(Folder);
