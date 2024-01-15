import React, { useEffect } from 'react';
import { Styles, withStyles } from '@mui/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import {
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

import { I18n } from '@iobroker/adapter-react-v5';

import { store } from '@/Store';

const styles: Styles<any, any> = (theme: any) => ({
    viewManageBlock: theme.classes.viewManageBlock,
    viewManageButtonActions: theme.classes.viewManageButtonActions,
    icon: {
        cursor: 'grab',
        display: 'inline-block',
        lineHeight: '18px',
    },
    name: {
        cursor: 'pointer',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    },
    dragging: {
        color: theme.palette.secondary.main,
    },
    noDrop: {
        opacity: 0.4,
    },
    tooltip: {
        pointerEvents: 'none',
    },
    visibleView: {
        color: theme.palette.primary.main,
    },
});

interface ViewProps {
    classes: Record<string, any>;
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
    /** If permissions are given do edit this view */
    hasPermissions: boolean;
}

const View = (props: ViewProps) => {
    const viewBlockPreview = <div className={props.classes.viewManageBlock}>
        <FileIcon />
        <Tooltip title={I18n.t(props.openedViews.includes(props.name) ? 'Hide' : 'Show')} classes={{ popper: props.classes.tooltip }}>
            <IconButton
                size="small"
                onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}
            >
                {props.openedViews.includes(props.name) ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </Tooltip>
        <span>{props.name}</span>
    </div>;

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

    return <div className={props.isDragging === props.name ? props.classes.dragging : (props.isDragging ? props.classes.noDrop : '')}>
        <div className={props.classes.viewManageBlock}>
            {props.hasPermissions ? <div className={props.classes.icon} ref={dragRef} title={I18n.t('Drag me')}><FileIcon /></div> : <FileIcon color="disabled" />}
            <Tooltip title={I18n.t(props.openedViews.includes(props.name) ? 'Hide' : 'Show')} classes={{ popper: props.classes.tooltip }}>
                <IconButton
                    disabled={!props.hasPermissions}
                    size="small"
                    onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}
                    className={props.isDragging === props.name ? props.classes.dragging : (props.isDragging ? props.classes.noDrop : '')}
                >
                    {props.openedViews.includes(props.name) ? <VisibilityIcon className={props.classes.visibleView} /> : <VisibilityOffIcon />}
                </IconButton>
            </Tooltip>
            {props.hasPermissions ? <span onClick={selectView} className={props.classes.name}>{props.name}</span> : <span style={{ color: 'grey' }}>{props.name}</span>}
            <span className={props.classes.viewManageButtonActions}>
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Import')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.setImportDialog(props.name)} size="small">
                        <BiImport />
                    </IconButton>
                </Tooltip> : null}
                <Tooltip title={I18n.t('Export')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.setExportDialog(props.name)} size="small">
                        <BiExport />
                    </IconButton>
                </Tooltip>
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Rename')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.showDialog('rename', props.name)} size="small">
                        <EditIcon />
                    </IconButton>
                </Tooltip> : null}
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Copy')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.showDialog('copy', props.name)} size="small">
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip> : null}
                {props.editMode && props.hasPermissions ? <Tooltip title={I18n.t('Delete')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.showDialog('delete', props.name)} size="small">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip> : null}
            </span>
        </div>
    </div>;
};

export default withStyles(styles)(View);
