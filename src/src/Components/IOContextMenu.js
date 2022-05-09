import { useState } from 'react';
import { NestedMenuItem, IconMenuItem } from 'mui-nested-menu';

import { Menu } from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';

const contextMenuItems = (items, open, onClose) =>
    items.map((item, key) => {
        if (item.items) {
            if (item.hide) {
                return null;
            }
            return <NestedMenuItem
                key={key}
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
            </NestedMenuItem>;
        }
        if (item.hide) {
            return null;
        }
        return <IconMenuItem
            key={key}
            onClick={() => {
                item.onClick();
                onClose();
            }}
            disabled={item.disabled}
            label={[
                <div style={{ display: 'flex', alignItems: 'center', ...item.style }}>
                    <span style={{ width: 40 }}>{item.leftIcon}</span>
                    {I18n.t(item.label)}
                </div>,
                item.subLabel ? <div style={{
                    fontSize: 10,
                    fontWeight: 'normal',
                    display: 'block',
                    paddingLeft: 40,
                    marginTop: -6,
                }}
                >
                    {item.subLabel}
                </div> : null,
            ]}
            onContextMenu={e => {
                e.stopPropagation();
                e.preventDefault();
                item.onClick();
                onClose();
            }}
        />;
    });

const IOContextMenu = props => {
    const [menuPosition, setMenuPosition] = useState(null);

    const handleRightClick = async event => {
        if (props.disabled || event.ctrlKey || event.shiftKey) {
            return;
        }
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

    return <div onContextMenu={handleRightClick} style={{ height: '100%' }}>
        {props.children}
        <Menu
            open={!!menuPosition}
            onClose={() => setMenuPosition(null)}
            anchorReference="anchorPosition"
            anchorPosition={menuPosition}
        >
            {contextMenuItems(props.menuItemsData(menuPosition), !!menuPosition, () => setMenuPosition(null))}
        </Menu>
    </div>;
};

export default IOContextMenu;
