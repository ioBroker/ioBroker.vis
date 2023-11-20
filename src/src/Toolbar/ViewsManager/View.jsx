import PropTypes from 'prop-types';
import { useEffect } from 'react';

import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    IconButton, Tooltip,
} from '@mui/material';

import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { BiImport, BiExport } from 'react-icons/bi';
import { withStyles } from '@mui/styles';
import { store } from '../../Store';

const styles = theme => ({
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

const View = props => {
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
                props.moveView(item.name, dropResult.folder.id);
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
            <div className={props.classes.icon} ref={dragRef} title={I18n.t('Drag me')}><FileIcon /></div>
            <Tooltip title={I18n.t(props.openedViews.includes(props.name) ? 'Hide' : 'Show')} classes={{ popper: props.classes.tooltip }}>
                <IconButton
                    size="small"
                    onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}
                    className={props.isDragging === props.name ? props.classes.dragging : (props.isDragging ? props.classes.noDrop : '')}
                >
                    {props.openedViews.includes(props.name) ? <VisibilityIcon className={props.classes.visibleView} /> : <VisibilityOffIcon />}
                </IconButton>
            </Tooltip>
            <span onClick={selectView} className={props.classes.name}>{props.name}</span>
            <span className={props.classes.viewManageButtonActions}>
                {props.editMode ? <Tooltip title={I18n.t('Import')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.setImportDialog(props.name)} size="small">
                        <BiImport />
                    </IconButton>
                </Tooltip> : null}
                <Tooltip title={I18n.t('Export')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.setExportDialog(props.name)} size="small">
                        <BiExport />
                    </IconButton>
                </Tooltip>
                {props.editMode ? <Tooltip title={I18n.t('Rename')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.showDialog('rename', props.name)} size="small">
                        <EditIcon />
                    </IconButton>
                </Tooltip> : null}
                {props.editMode ? <Tooltip title={I18n.t('Copy')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.showDialog('copy', props.name)} size="small">
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip> : null}
                {props.editMode ? <Tooltip title={I18n.t('Delete')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => props.showDialog('delete', props.name)} size="small">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip> : null}
            </span>
        </div>
    </div>;
};

View.propTypes = {
    classes: PropTypes.object,
    moveView: PropTypes.func,
    name: PropTypes.string,
    openedViews: PropTypes.array,
    setExportDialog: PropTypes.func,
    setImportDialog: PropTypes.func,
    showDialog: PropTypes.func,
    toggleView: PropTypes.func,
    setIsDragging: PropTypes.func,
    isDragging: PropTypes.string,
    editMode: PropTypes.bool,
};

export default withStyles(styles)(View);
