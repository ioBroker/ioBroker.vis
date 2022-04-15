import I18n from '@iobroker/adapter-react-v5/i18n';
import { Menu } from '@mui/material';

import { NestedMenuItem, IconMenuItem } from 'mui-nested-menu';

import { useState } from 'react';

const contextMenuItems = (items, open, onClose) =>
    items.map(item => (item.items ?
        <NestedMenuItem
            leftIcon={item.leftIcon}
            disabled={item.disabled}
            label={<span style={{ width: 40 }}>{I18n.t(item.label)}</span>}
            parentMenuOpen={open}
            onContextMenu={e => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            {contextMenuItems(item.items, open, onClose)}
        </NestedMenuItem> :
        <IconMenuItem
            onClick={() => {
                item.onClick();
                onClose();
            }}
            disabled={item.disabled}
            label={<span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 40 }}>{item.leftIcon}</span>
                {I18n.t(item.label)}
            </span>}
            onContextMenu={e => {
                e.stopPropagation();
                e.preventDefault();
                item.onClick();
                onClose();
            }}
        />
    ));

const IOContextMenu = props => {
    const [menuPosition, setMenuPosition] = useState(null);

    const handleRightClick = async event => {
        event.preventDefault();
        if (menuPosition) {
            setMenuPosition(null);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        setMenuPosition({
            top: event.pageY,
            left: event.pageX,
        });
    };

    return (
        <div onContextMenu={handleRightClick}>
            {props.children}
            <Menu
                open={!!menuPosition}
                onClose={() => setMenuPosition(null)}
                anchorReference="anchorPosition"
                anchorPosition={menuPosition}
            >
                {contextMenuItems(props.menuItemsData, !!menuPosition, () => setMenuPosition(null))}
            </Menu>
        </div>
    );
};

export default IOContextMenu;