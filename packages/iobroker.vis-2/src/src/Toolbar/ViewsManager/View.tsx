import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import {
    Box,
    IconButton, Tooltip,
} from '@mui/material';

import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    FileCopy as FileCopyIcon,
    InsertDriveFile as FileIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { BiImport, BiExport } from 'react-icons/bi';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

import type { VisTheme } from '@iobroker/types-vis-2';
import { store } from '@/Store';

const styles: Record<string, any> = {
    viewManageBlock: (theme: VisTheme) => theme.classes.viewManageBlock,
    viewManageButtonActions: (theme: VisTheme) => theme.classes.viewManageButtonActions,
    icon: {
        cursor: 'grab',
        display: 'inline-block',
        lineHeight: '18px',
    },
    name: (theme: VisTheme) => ({
        cursor: 'pointer',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    }),
    dragging: (theme: VisTheme) => ({
        color: theme.palette.secondary.main,
    }),
    noDrop: {
        opacity: 0.4,
    },
    tooltip: {
        pointerEvents: 'none',
    },
    visibleView: (theme: VisTheme) => ({
        color: theme.palette.primary.main,
    }),
    selected: (theme: VisTheme) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
    }),
};

interface ViewProps {
    moveView: (view: string, folder: string) => void;
    name: string;
    openedViews: string[];
    setExportDialog: (view: string) => void;
    setImportDialog: (view: string) => void;
    showDialog: (action: 'rename' | 'copy' | 'delete', view: string) => void;
    toggleView: (view: string, isShow: boolean, isActivate?: boolean) => void;
    setIsDragging: (view: string) => void;
    isDragging: string;
    editMode: boolean;
    theme: VisTheme;
    selectedView: string;
    /** If permissions are given, do edit this view */
    hasPermissions: boolean;
}

const View = (props: ViewProps) => {
    const viewBlockPreview = <Box component="div" sx={styles.viewManageBlock}>
        <FileIcon />
        <Tooltip title={I18n.t(props.openedViews.includes(props.name) ? 'Hide' : 'Show')} componentsProps={{ popper: { sx: styles.tooltip } }}>
            <IconButton
                size="small"
                onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}
            >
                {props.openedViews.includes(props.name) ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </Tooltip>
        <span>{props.name}</span>
    </Box>;

    const [{ isDraggingThisItem }, dragRef, preview] = useDrag({
        type: 'view',
        item: () => ({
            name: props.name,
            preview: <div>{viewBlockPreview}</div>,
        }),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                props.moveView(item.name, (dropResult as any).folder.id);
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
        props.setIsDragging(isDraggingThisItem ? props.name : '');
    }, [isDraggingThisItem]);

    const selectView = () => {
        props.toggleView(props.name, true, true);
    };

    return <Box
        sx={Utils.getStyle(
            props.theme,
            props.isDragging === props.name ? styles.dragging : (props.isDragging ? styles.noDrop : undefined),
            props.selectedView === props.name && styles.selected,
        )}
    >
        <Box component="div" sx={styles.viewManageBlock}>
            {props.hasPermissions ? <div style={styles.icon} ref={dragRef} title={I18n.t('Drag me')}>
                <FileIcon />
            </div> : <FileIcon color="disabled" />}
            <Tooltip
                title={I18n.t(props.openedViews.includes(props.name) ? 'Hide' : 'Show')}
                componentsProps={{ popper: { sx: styles.tooltip } }}
            >
                <IconButton
                    disabled={!props.hasPermissions}
                    size="small"
                    onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}
                    sx={props.isDragging === props.name ? styles.dragging : (props.isDragging ? styles.noDrop : undefined)}
                >
                    {props.openedViews.includes(props.name) ? <VisibilityIcon style={Utils.getStyle(props.theme, styles.visibleView)} /> : <VisibilityOffIcon />}
                </IconButton>
            </Tooltip>
            {props.hasPermissions ? <Box component="span" onClick={selectView} sx={styles.name}>{props.name}</Box> : <span style={{ color: 'grey' }}>{props.name}</span>}
            <Box component="span" sx={styles.viewManageButtonActions}>
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Import')} componentsProps={{ popper: { sx: styles.tooltip } }}>
                    <IconButton onClick={() => props.setImportDialog(props.name)} size="small">
                        <BiImport />
                    </IconButton>
                </Tooltip> : null}
                <Tooltip title={I18n.t('Export')} componentsProps={{ popper: { sx: styles.tooltip } }}>
                    <IconButton onClick={() => props.setExportDialog(props.name)} size="small">
                        <BiExport />
                    </IconButton>
                </Tooltip>
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Rename')} componentsProps={{ popper: { sx: styles.tooltip } }}>
                    <IconButton onClick={() => props.showDialog('rename', props.name)} size="small">
                        <EditIcon />
                    </IconButton>
                </Tooltip> : null}
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Copy')} componentsProps={{ popper: { sx: styles.tooltip } }}>
                    <IconButton onClick={() => props.showDialog('copy', props.name)} size="small">
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip> : null}
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Delete')} componentsProps={{ popper: { sx: styles.tooltip } }}>
                    <IconButton onClick={() => props.showDialog('delete', props.name)} size="small">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip> : null}
            </Box>
        </Box>
    </Box>;
};

export default View;
