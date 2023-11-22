import PropTypes from 'prop-types';
import { useState } from 'react';
import { NestedMenuItem, IconMenuItem } from 'mui-nested-menu/index';

import { Menu } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

const contextMenuItems = (items, open, onClose) =>
    items.map((item, key) => {
        if (!item || item.hide) {
            return null;
        }

        if (item.items) {
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

        return <IconMenuItem
            key={key}
            onClick={() => {
                item.onClick();
                onClose();
            }}
            disabled={item.disabled}
            label={[
                <span key="main" style={{ display: 'flex', alignItems: 'center', ...item.style }}>
                    <span style={{ width: 40 }}>{item.leftIcon}</span>
                    {I18n.t(item.label)}
                </span>,
                item.subLabel ? <span
                    key="second"
                    style={{
                        fontSize: 10,
                        fontWeight: 'normal',
                        display: 'block',
                        paddingLeft: 40,
                        marginTop: -6,
                    }}
                >
                    {item.subLabel}
                </span> : null,
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
            await new Promise(resolve => {
                setTimeout(resolve, 200);
            });
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

IOContextMenu.propTypes = {
    children: PropTypes.any,
    disabled: PropTypes.bool,
    menuItemsData: PropTypes.func,
};

export default IOContextMenu;
