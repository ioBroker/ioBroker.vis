import PropTypes from 'prop-types';
import { useDrop  } from 'react-dnd';
import { useEffect } from 'react';

import I18n from '@iobroker/adapter-react-v5/i18n';
import { store } from '../../Store';

const Root = props => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
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
    project: PropTypes.object,
    setIsOverRoot: PropTypes.func,
};

export default Root;
