import React, { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import {
    Box,
    IconButton, Tooltip,
} from '@mui/material';

import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CreateNewFolder as CreateNewFolderClosedIcon,
} from '@mui/icons-material';
import { FaFolder as FolderClosedIcon, FaFolderOpen as FolderOpenedIcon } from 'react-icons/fa';

import { Utils, I18n } from '@iobroker/adapter-react-v5';
import type { VisTheme } from '@iobroker/types-vis-2';
import { store } from '../../Store';

const styles: Record<string, any> = {
    viewManageBlock: (theme: VisTheme) => theme.classes.viewManageBlock,
    viewManageButtonActions: (theme: VisTheme) => theme.classes.viewManageButtonActions,
    folderName: {
        marginLeft: 8,
        fontWeight: 'bold',
    },
    icon: (theme: VisTheme) => ({
        cursor: 'grab',
        display: 'inline-block',
        lineHeight: '16px',
        color: theme.palette.mode === 'dark' ? '#bad700' : '#f3bf00',
    }),
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
};

export interface FolderType {
    id: string;
    name: string;
    parentId: string;
}

interface FolderProps {
    folder: FolderType;
    moveFolder: (id: string, parentId: string) => void;
    setFolderDialog: (dialog: 'add' | 'rename' | 'delete') => void;
    setFolderDialogId: (id: string) => void;
    setFolderDialogName: (name: string) => void;
    setFolderDialogParentId: (parentId: string) => void;
    setIsDragging: (isDragging: string) => void;
    isDragging: string;
    editMode: boolean;
    foldersCollapsed: string[];
    setFoldersCollapsed: (foldersCollapsed: string[]) => void;
    showDialog: (dialog: string, view: string, parentId: string) => void;
    theme: VisTheme;
}

const Folder: React.FC<FolderProps> = props => {
    const folderBlock = <Box component="div" sx={styles.viewManageBlock}>
        {props.foldersCollapsed.includes(props.folder.id)
            ? <FolderClosedIcon fontSize={20} />
            : <FolderOpenedIcon fontSize={20} />}
        <span style={styles.folderName}>{props.folder.name}</span>
    </Box>;

    const [{ canDrop }, drop] = useDrop<{
        name: string;
        folder: FolderType;
    }, unknown, { isOver: boolean; canDrop: boolean }>(() => ({
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
            const dropResult = monitor.getDropResult<{folder: FolderType}>();
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

    return <Box
        component="div"
        ref={drop}
        sx={Utils.getStyle(props.theme, styles.root, styles.viewManageBlock, props.isDragging && !canDrop && styles.noDrop, props.isDragging && canDrop && styles.rootCanDrop)}
    >
        <Box
            component="div"
            sx={styles.icon}
            ref={dragRef}
            title={I18n.t('Drag me')}
        >
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
        </Box>
        <span style={styles.folderName}>{props.folder.name}</span>
        <Box component="span" sx={styles.viewManageButtonActions}>
            {props.editMode ? <Tooltip title={I18n.t('Add view')} componentsProps={{ popper: { sx: styles.tooltip } }}>
                <IconButton
                    size="small"
                    onClick={() => {
                        props.showDialog('add', null, props.folder.id);
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Tooltip> : null}
            {props.editMode ? <Tooltip title={I18n.t('Add sub-folder')} componentsProps={{ popper: { sx: styles.tooltip } }}>
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
            {props.editMode ? <Tooltip title={I18n.t('Rename')} componentsProps={{ popper: { sx: styles.tooltip } }}>
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
            {props.editMode ? <Tooltip title={I18n.t('Delete')} componentsProps={{ popper: { sx: styles.tooltip } }}>
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
        </Box>
    </Box>;
};

export default Folder;
