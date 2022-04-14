import { Menu } from '@mui/material';

import { NestedMenuItem, IconMenuItem } from 'mui-nested-menu';

import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';
import { useState } from 'react';

const iconStyle = { width: 40 };

const menuItemsData = [
    {
        leftIcon: <BiCopy style={iconStyle} />,
        label: 'Copy',
        onClick: () => console.log('New clicked'),
    },
    {
        leftIcon: <BiCut style={iconStyle} />,
        label: 'Cut',
        onClick: () => console.log('Save clicked'),
    },
    {
        leftIcon: <BiPaste style={iconStyle} />,
        label: 'Paste',
        onClick: () => console.log('Save clicked'),
    },
    {
        leftIcon: <DeleteIcon style={iconStyle} fontSize="small" />,
        label: 'Delete',
        onClick: () => console.log('Save clicked'),
    },
    {
        label: 'More',
        leftIcon: <span style={iconStyle} />,
        items: [
            {
                leftIcon: <LockIcon style={iconStyle} fontSize="small" />,
                label: 'Lock',
                onClick: () => console.log('Save As > Option 1 clicked'),
            },
            {
                leftIcon: <LockOpenIcon style={iconStyle} fontSize="small" />,
                label: 'Unlock',
                onClick: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <RiBringToFront style={iconStyle} />,
                label: 'Bring to front',
                onClick: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <RiSendToBack style={iconStyle} />,
                label: 'Sent to back',
                onClick: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <BiExport style={iconStyle} />,
                label: 'Export widgets',
                onClick: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <BiImport style={iconStyle} />,
                label: 'Import widgets',
                onClick: () => console.log('Save As > Option 2 clicked'),
            },
        ],
    },
];

const contextMenuItems = (items, open, onClose) =>
    items.map(item => (item.items ?
        <NestedMenuItem
            leftIcon={item.leftIcon}
            label={item.label}
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
            label={<span style={{ display: 'flex', alignItems: 'center' }}>
                {item.leftIcon}
                {item.label}
            </span>}
            onContextMenu={e => {
                e.stopPropagation();
                e.preventDefault();
                item.onClick();
                onClose();
            }}
        />
    ));

const VisContextMenu = props => {
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
                {contextMenuItems(menuItemsData, !!menuPosition, () => setMenuPosition(null))}
            </Menu>
        </div>
    );
};

export default VisContextMenu;
