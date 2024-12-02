import React, { useState } from 'react';
import { NestedMenuItem, IconMenuItem } from 'mui-nested-menu/index';

import { Menu } from '@mui/material';

import { I18n } from '@iobroker/adapter-react-v5';

interface MenuItem {
    label: string;
    subLabel?: string;
    hide?: boolean;
    items?: MenuItem[];
    leftIcon?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

const contextMenuItems = (items: MenuItem[], open: boolean, onClose: () => void): React.JSX.Element[] =>
    items.map((item, key: number) => {
        if (!item || item.hide) {
            return null;
        }

        if (item.items) {
            return (
                <NestedMenuItem
                    key={key}
                    leftIcon={item.leftIcon}
                    disabled={item.disabled}
                    // @ts-expect-error we can provide an Element here too and it works
                    label={<span style={{ width: 40 }}>{I18n.t(item.label)}</span>}
                    parentMenuOpen={open}
                    onContextMenu={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {contextMenuItems(item.items, open, onClose)}
                </NestedMenuItem>
            );
        }

        return (
            <IconMenuItem
                key={key}
                onClick={() => {
                    item.onClick && item.onClick();
                    onClose();
                }}
                disabled={item.disabled}
                // @ts-expect-error we can provide an Element here too and it works
                label={[
                    <span
                        key="main"
                        style={{ display: 'flex', alignItems: 'center', ...item.style }}
                    >
                        <span style={{ width: 40 }}>{item.leftIcon}</span>
                        {I18n.t(item.label)}
                    </span>,
                    item.subLabel ? (
                        <span
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
                        </span>
                    ) : null,
                ]}
                onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    e.preventDefault();
                    item.onClick && item.onClick();
                    onClose();
                }}
            />
        );
    });

interface IOContextMenuProps {
    children: React.ReactNode;
    disabled: boolean;
    menuItemsData: (position: { top: number; left: number }) => any;
}

const IOContextMenu = (props: IOContextMenuProps): React.JSX.Element => {
    const [menuPosition, setMenuPosition] = useState<null | { top: number; left: number }>(null);

    const handleRightClick: React.MouseEventHandler<HTMLDivElement> = async (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
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

    return (
        <div
            onContextMenu={handleRightClick}
            style={{ height: '100%', width: '100%' }}
        >
            {props.children}
            {menuPosition ? (
                <Menu
                    open={!0}
                    onClose={() => setMenuPosition(null)}
                    anchorReference="anchorPosition"
                    anchorPosition={menuPosition}
                >
                    {contextMenuItems(props.menuItemsData(menuPosition), !!menuPosition, () => setMenuPosition(null))}
                </Menu>
            ) : null}
        </div>
    );
};

export default IOContextMenu;
