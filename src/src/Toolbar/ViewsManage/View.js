import { useEffect, useRef } from 'react';

import I18n from '@iobroker/adapter-react/i18n';
import {
    IconButton, Tooltip,
} from '@material-ui/core';

import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { BiImport, BiExport } from 'react-icons/bi';

const View = props => {
    const viewBlock = <div className={props.classes.viewManageBlock}>
        <FileIcon />
        <Tooltip title={I18n.t(props.openedViews.includes(props.name) ? 'Hide' : 'Show')}>
            <IconButton size="small" onClick={() => props.toggleView(props.name, !props.openedViews.includes(props.name))}>
                {props.openedViews.includes(props.name) ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </Tooltip>
        <span>{props.name}</span>
        <span className={props.classes.buttonActions}>
            <Tooltip title={I18n.t('Import')}>
                <IconButton onClick={() => props.setImportDialog(props.name)} size="small">
                    <BiImport />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Export')}>
                <IconButton onClick={() => props.setExportDialog(props.name)} size="small">
                    <BiExport />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Rename')}>
                <IconButton onClick={() => props.showDialog('rename', props.name)} size="small">
                    <EditIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Copy')}>
                <IconButton onClick={() => props.showDialog('copy', props.name)} size="small">
                    <FileCopyIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Delete')}>
                <IconButton onClick={() => props.showDialog('delete', props.name)} size="small">
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </span>
    </div>;

    const widthRef = useRef();
    const [, dragRef, preview] = useDrag(
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
    }, [props.project]);

    return <div ref={dragRef}>
        <div ref={widthRef}>
            {viewBlock}
        </div>
    </div>;
};

export default View;
