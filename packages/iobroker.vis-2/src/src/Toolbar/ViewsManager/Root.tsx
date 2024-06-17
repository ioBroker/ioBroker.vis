import PropTypes from 'prop-types';
import { useDrop  } from 'react-dnd';
import React, { useEffect } from 'react';

import { I18n } from '@iobroker/adapter-react-v5';
import { store } from '../../Store';
import { FolderType } from './Folder';

interface RootProps {
    setIsOverRoot: (isOver: boolean) => void;
    isDragging: string;
}

const Root:React.FC<RootProps> = props => {
    const [{ canDrop, isOver }, drop] = useDrop<{
        name: string;
        folder: FolderType;
    }, unknown, { isOver: boolean; canDrop: boolean }>(() => ({
        accept: ['view', 'folder'],
        drop: () => ({ folder: { id: null } }),
        canDrop: (item, monitor) => {
            if (monitor.getItemType() === 'view') {
                return !!store.getState().visProject[item.name].parentId;
            }
            if (monitor.getItemType() === 'folder') {
                return !!item.folder.parentId;
            }
            return false;
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [store.getState().visProject]);

    useEffect(() => {
        props.setIsOverRoot(isOver && canDrop);
    }, [isOver]);

    return props.isDragging && canDrop ? <div
        ref={drop}
    >
        <div style={{ height: 34, width: 'calc(100% - 7px)', opacity: 0.7 }}>{I18n.t('Drop here to add to root')}</div>
    </div> : null;
};

Root.propTypes = {
    setIsOverRoot: PropTypes.func,
};

export default Root;
