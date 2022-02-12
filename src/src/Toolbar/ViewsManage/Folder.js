import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react/i18n';
import {
    IconButton, Tooltip,
} from '@material-ui/core';

import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FolderIcon from '@material-ui/icons/Folder';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import { useEffect, useRef } from 'react';

const Folder = props => {
    const folderBlock = <div className={props.classes.viewManageBlock}>
        <FolderIcon />
        {props.folder.name}
        {props.folder.id ? <span className={props.classes.buttonActions}>
            <Tooltip title={I18n.t('Add subfolder')}>
                <IconButton
                    size="small"
                    onClick={() => {
                        props.setFolderDialog('add');
                        props.setFolderDialogName('');
                        props.setFolderDialogParentId(props.folder.id);
                    }}
                >
                    <CreateNewFolderIcon />
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
        </span> : null}
    </div>;

    const [{ CanDrop, isOver }, drop] = useDrop(() => ({
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
            CanDrop: monitor.canDrop(),
        }),
    }), [props.project]);

    const widthRef = useRef();
    const [, dragRef, preview] = useDrag(
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
    }, [props.project]);

    return <div
        ref={drop}
        style={isOver && CanDrop ? { borderStyle: 'dashed', borderRadius: 4, borderWidth: 1 } : null}
    >
        <div ref={dragRef}>
            <div ref={widthRef}>
                {folderBlock}
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
};

export default Folder;
